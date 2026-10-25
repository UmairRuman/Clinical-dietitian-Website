import { NextResponse } from "next/server";
import { getAdmin } from "@/server/auth";
import { buildIcs, loadCard } from "@/server/cards";

export async function GET(_req: Request, ctx: RouteContext<"/api/cards/[id]/ics">) {
  if (!(await getAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse("Not found", { status: 404 });
  const card = await loadCard(id);
  if (!card) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(buildIcs(card), {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="appointment-${card.reference}.ics"`, "Cache-Control": "private, no-store" },
  });
}
