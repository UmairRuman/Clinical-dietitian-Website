import { NextResponse, type NextRequest } from "next/server";
import { getAdmin } from "@/server/auth";
import { cardToPdf, loadCard, renderCardPng } from "@/server/cards";

/** Admin-only appointment card as PNG (default) or PDF. */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/cards/[id]">) {
  if (!(await getAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse("Not found", { status: 404 });
  const card = await loadCard(id);
  if (!card) return new NextResponse("Not found", { status: 404 });

  const png = await renderCardPng(card);
  const url = new URL(req.url);
  const name = `appointment-${card.reference}`;
  const headers = { "Cache-Control": "private, no-store" };

  if (url.searchParams.get("format") === "pdf") {
    const pdf = await cardToPdf(png);
    return new NextResponse(Buffer.from(pdf), { headers: { ...headers, "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${name}.pdf"` } });
  }
  return new NextResponse(new Uint8Array(png), {
    headers: { ...headers, "Content-Type": "image/png", ...(url.searchParams.has("download") ? { "Content-Disposition": `attachment; filename="${name}.png"` } : {}) },
  });
}
