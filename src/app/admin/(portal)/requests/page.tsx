import Link from "next/link";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { btnDanger, btnPrimary, btnSoft } from "@/components/admin/styles";
import { Badge, Card, Empty, PageTitle } from "@/components/admin/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDate, fmtDateTime } from "@/lib/dates";
import { requireAdmin } from "@/server/auth";
import { deleteRequest, setRequestStatus } from "./actions";

export const metadata = { title: "Booking requests" };

// Private admin page: waits for the session by design.
export const instant = false;

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireAdmin();
  const { show } = await searchParams;
  const all = show === "all";
  let q = createAdminClient().from("booking_requests").select("*").order("created_at", { ascending: false }).limit(100);
  if (!all) q = q.in("status", ["new"]);
  const { data } = await q;

  return (
    <>
      <PageTitle
        title="Booking requests"
        intro="Enquiries sent from the website's contact form. Convert one into an appointment with a single click."
        actions={<Link href={all ? "/admin/requests" : "/admin/requests?show=all"} className={btnSoft}>{all ? "Show only new" : "Show all"}</Link>}
      />
      {data?.length ? (
        <ul className="space-y-4">
          {data.map((r) => (
            <li key={r.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[22px] text-forest-900">{r.name}</p>
                    <p className="text-sm text-ink-soft">Received {fmtDateTime(r.created_at)}</p>
                  </div>
                  <Badge status={r.status} />
                </div>
                <dl className="mt-4 grid gap-x-6 gap-y-1.5 text-[15px] sm:grid-cols-2">
                  <div><dt className="inline font-semibold text-forest-700">Phone: </dt><dd className="inline"><a href={`tel:${r.phone}`} className="underline underline-offset-4">{r.phone}</a></dd></div>
                  {r.email && <div><dt className="inline font-semibold text-forest-700">Email: </dt><dd className="inline break-all">{r.email}</dd></div>}
                  <div><dt className="inline font-semibold text-forest-700">Preferred: </dt><dd className="inline">{r.preferred_date ? fmtDate(`${r.preferred_date}T00:00:00+05:00`) : "-"} {r.preferred_time?.slice(0, 5)}</dd></div>
                  {r.concern && <div><dt className="inline font-semibold text-forest-700">Concern: </dt><dd className="inline">{r.concern}</dd></div>}
                </dl>
                {r.message && <p dir="auto" className="mt-3 whitespace-pre-wrap rounded-xl bg-mint-50 p-3 text-[15px]">{r.message}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.status !== "converted" && <Link href={`/admin/bookings?new=1&from=${r.id}`} className={btnPrimary}>Convert to appointment</Link>}
                  <a href={`https://wa.me/${r.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className={btnSoft}>WhatsApp</a>
                  {r.status === "new" && <form action={setRequestStatus.bind(null, r.id, "closed")}><button className={btnSoft}>Mark closed</button></form>}
                  {r.status === "closed" && <form action={setRequestStatus.bind(null, r.id, "new")}><button className={btnSoft}>Reopen</button></form>}
                  <form action={deleteRequest.bind(null, r.id)} className="ml-auto"><ConfirmButton message="Delete this request permanently?" className={btnDanger}>Delete</ConfirmButton></form>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>{all ? "No requests yet." : "No new requests. Nice and quiet."}</Empty>
      )}
    </>
  );
}
