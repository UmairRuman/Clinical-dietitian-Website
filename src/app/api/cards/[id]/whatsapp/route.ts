import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDate, fmtTime } from "@/lib/dates";
import { waDigits } from "@/lib/phone";
import { getAdmin } from "@/server/auth";
import { loadCard, renderCardPng } from "@/server/cards";

/**
 * Admin-only: stores the card privately, then redirects to WhatsApp with a ready-to-send message.
 * The card image is shared through a signed link that expires after 7 days.
 */
export async function GET(_req: Request, ctx: RouteContext<"/api/cards/[id]/whatsapp">) {
  if (!(await getAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse("Not found", { status: 404 });
  const card = await loadCard(id);
  if (!card) return new NextResponse("Not found", { status: 404 });

  const db = createAdminClient();
  const cancelled = card.status === "cancelled";
  let link = "";
  if (!cancelled) {
    const path = `${id}/v${card.version}.png`;
    await db.storage.from("cards").upload(path, await renderCardPng(card), { contentType: "image/png", upsert: true });
    const { data: signed } = await db.storage.from("cards").createSignedUrl(path, 7 * 24 * 3600);
    link = signed?.signedUrl ?? "";
  }
  const { data: a } = await db.from("appointments").select("client_phone").eq("id", id).single();

  const text = [
    `Hello ${card.clientName},`,
    cancelled
      ? `Your appointment with ${card.doctor} on ${fmtDate(card.start)} at ${fmtTime(card.start)} has been cancelled.`
      : `Your appointment with ${card.doctor} is booked for ${fmtDate(card.start)} at ${fmtTime(card.start)} (PKT).`,
    !cancelled ? `Method: ${card.method}${card.where ? `\n${card.where}` : ""}` : "",
    `Reference: ${card.reference}`,
    link ? `Your appointment card: ${link}` : "",
    !cancelled && card.note ? card.note : "",
  ].filter(Boolean).join("\n");

  return NextResponse.redirect(`https://wa.me/${waDigits(a?.client_phone ?? "")}?text=${encodeURIComponent(text)}`);
}
