import Link from "next/link";
import { Badge, Card, Empty, PageTitle } from "@/components/admin/ui";
import { btnSoft } from "@/components/admin/styles";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDate, fmtTime, pktDayRange } from "@/lib/dates";
import { requireAdmin } from "@/server/auth";

export const metadata = { title: "Dashboard" };

// Private admin page: waits for the session by design.
export const instant = false;

export default async function Dashboard() {
  await requireAdmin();
  const db = createAdminClient();
  const { start, end } = pktDayRange(new Date());
  const weekEnd = new Date(end.getTime() + 6 * 86_400_000);

  const [today, upcoming, pending, requests] = await Promise.all([
    db.from("appointments").select("id,client_name,starts_at,duration_min,meeting_source,status,reference").gte("starts_at", start.toISOString()).lt("starts_at", end.toISOString()).neq("status", "cancelled").order("starts_at"),
    db.from("appointments").select("id,client_name,starts_at,status").gte("starts_at", end.toISOString()).lt("starts_at", weekEnd.toISOString()).neq("status", "cancelled").order("starts_at").limit(6),
    db.from("submissions").select("id,type,display_name,body,created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
    db.from("booking_requests").select("id,name,phone,concern,created_at").eq("status", "new").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <>
      <PageTitle
        title="Good to see you"
        intro={`Today is ${fmtDate(new Date(), { weekday: "long", day: "numeric", month: "long" })}.`}
        actions={<Link href="/admin/bookings" className={btnSoft}>Open calendar</Link>}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Today's appointments" action={<Link href="/admin/bookings" className="text-sm font-semibold text-forest-700 underline underline-offset-4">Calendar</Link>}>
          {today.data?.length ? (
            <ul className="divide-y divide-leaf-400/25">
              {today.data.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/bookings?edit=${a.id}`} className="flex items-center justify-between gap-3 py-3">
                    <span>
                      <span className="block font-semibold">{a.client_name}</span>
                      <span className="block text-sm text-ink-soft">{fmtTime(a.starts_at)} · {a.duration_min} min · {a.meeting_source.replace("_", " ")}</span>
                    </span>
                    <Badge status={a.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No appointments today.</Empty>
          )}
          {!!upcoming.data?.length && (
            <>
              <p className="mb-2 mt-5 text-[12px] font-bold uppercase tracking-[0.1em] text-forest-700">Next 7 days</p>
              <ul className="space-y-1.5 text-sm">
                {upcoming.data.map((a) => (
                  <li key={a.id} className="flex justify-between gap-3">
                    <span>{a.client_name}</span>
                    <span className="text-ink-soft">{fmtDate(a.starts_at, { weekday: "short", day: "numeric", month: "short" })}, {fmtTime(a.starts_at)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card title="Booking requests" action={<Link href="/admin/requests" className="text-sm font-semibold text-forest-700 underline underline-offset-4">All requests</Link>}>
          {requests.data?.length ? (
            <ul className="divide-y divide-leaf-400/25">
              {requests.data.map((r) => (
                <li key={r.id} className="py-3">
                  <Link href="/admin/requests" className="block">
                    <span className="block font-semibold">{r.name}</span>
                    <span className="block text-sm text-ink-soft">{r.phone}{r.concern ? ` · ${r.concern}` : ""}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No new enquiries.</Empty>
          )}
        </Card>

        <Card title="Awaiting review" className="lg:col-span-2" action={<Link href="/admin/moderation" className="text-sm font-semibold text-forest-700 underline underline-offset-4">Review all</Link>}>
          {pending.data?.length ? (
            <ul className="divide-y divide-leaf-400/25">
              {pending.data.map((s) => (
                <li key={s.id}>
                  <Link href={`/admin/moderation?open=${s.id}`} className="flex items-start justify-between gap-4 py-3">
                    <span className="min-w-0">
                      <span className="block font-semibold">{s.display_name} <span className="font-normal text-ink-soft">· {s.type}</span></span>
                      <span dir="auto" className="line-clamp-2 text-sm text-ink-soft">{s.body}</span>
                    </span>
                    <Badge status="pending" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nothing waiting for review.</Empty>
          )}
        </Card>
      </div>
    </>
  );
}
