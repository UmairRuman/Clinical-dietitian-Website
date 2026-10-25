"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDate, fmtTime } from "@/lib/dates";
import { buildIcs, loadCard, renderCardPng } from "@/server/cards";
import { requireAdmin } from "@/server/auth";
import { emailLayout, sendEmail } from "@/server/email";

/** Emails the card (PNG) and a calendar file to the client. */
export async function emailCard(id: string): Promise<void> {
  await requireAdmin();
  const card = await loadCard(id);
  if (!card) redirect("/admin/bookings");
  const { data: a } = await createAdminClient().from("appointments").select("client_email").eq("id", id).single();
  if (!a?.client_email) redirect(`/admin/bookings?edit=${id}&sent=noemail`);

  const png = await renderCardPng(card);
  const cancelled = card.status === "cancelled";
  const ok = await sendEmail({
    to: a.client_email,
    subject: cancelled ? `Appointment cancelled (${card.reference})` : `Your appointment with ${card.doctor}`,
    html: emailLayout(
      cancelled ? "Your appointment was cancelled" : "Your appointment is booked",
      [
        ["When", `${fmtDate(card.start)} at ${fmtTime(card.start)} (PKT)`],
        ["Method", card.method],
        ...(card.where ? ([["Where", card.where]] as [string, string][]) : []),
        ["Reference", card.reference],
      ],
      cancelled ? "Please contact us to arrange a new time." : "Your appointment card is attached. Open the calendar file to add it to your phone.",
    ),
    attachments: [
      { filename: `appointment-${card.reference}.png`, content: png },
      ...(cancelled ? [] : [{ filename: `appointment-${card.reference}.ics`, content: Buffer.from(buildIcs(card)) }]),
    ],
  });
  redirect(`/admin/bookings?edit=${id}&sent=${ok ? "email" : "failed"}`);
}
