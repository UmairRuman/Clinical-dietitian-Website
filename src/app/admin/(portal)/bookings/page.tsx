import Link from "next/link";
import { AppointmentForm, type AppointmentInitial } from "@/components/admin/AppointmentForm";
import { Calendar } from "@/components/admin/Calendar";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { btnDanger, btnPrimary, btnSoft, inputCls, labelCls } from "@/components/admin/styles";
import { Badge, Card, PageTitle } from "@/components/admin/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { sourceLabel, type CalView } from "@/lib/bookings";
import { addDaysKey, fmtDateTime, isDateKey, keyStartInstant, monthStartKey, pad, pktDateKey, pktParts, weekStartKey } from "@/lib/dates";
import { requireAdmin } from "@/server/auth";
import { getSettings } from "@/server/settings";
import { cancelAppointment, deleteAppointment } from "./actions";
import { emailCard } from "./card-actions";

export const metadata = { title: "Bookings" };

type SP = { view?: string; date?: string; new?: string; at?: string; time?: string; edit?: string; from?: string; sent?: string };
const VIEWS: CalView[] = ["month", "week", "day", "list"];

// Private admin page: waits for the session by design.
export const instant = false;

export default async function BookingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;
  const today = pktDateKey(new Date());
  const view: CalView = (VIEWS as string[]).includes(sp.view ?? "") ? (sp.view as CalView) : "month";
  const focus = isDateKey(sp.date) ? sp.date : today;

  const rangeStart = view === "month" ? weekStartKey(monthStartKey(focus)) : view === "week" ? weekStartKey(focus) : focus;
  const rangeEnd = addDaysKey(rangeStart, view === "month" ? 42 : view === "week" ? 7 : view === "day" ? 1 : 60);

  const db = createAdminClient();
  const settings = await getSettings();
  const [{ data: appts }, { data: serviceRows }] = await Promise.all([
    db.from("appointments").select("id,client_name,starts_at,ends_at,status,meeting_source").gte("starts_at", keyStartInstant(rangeStart).toISOString()).lt("starts_at", keyStartInstant(rangeEnd).toISOString()).order("starts_at"),
    db.from("services").select("title").order("sort_order"),
  ]);
  const events = (appts ?? []).map((a) => ({ id: a.id, name: a.client_name, start: a.starts_at, end: a.ends_at, status: a.status, source: a.meeting_source }));
  const serviceNames = serviceRows?.map((s) => s.title) ?? [];

  // ── which panel (if any) is open
  let panel: { title: string; initial: AppointmentInitial; existing?: Record<string, unknown> } | null = null;
  const editId = sp.edit && /^[0-9a-f-]{36}$/.test(sp.edit) ? sp.edit : null;

  if (editId) {
    const { data: a } = await db.from("appointments").select("*").eq("id", editId).maybeSingle();
    if (a) {
      const p = pktParts(new Date(a.starts_at));
      panel = {
        title: a.client_name,
        existing: a,
        initial: {
          id: a.id, clientName: a.client_name, clientPhone: a.client_phone, clientEmail: a.client_email ?? "",
          date: `${p.y}-${pad(p.m)}-${pad(p.d)}`, time: `${pad(p.h)}:${pad(p.min)}`, duration: a.duration_min,
          source: a.meeting_source, sourceOther: a.meeting_source_other ?? "", link: a.meeting_link ?? "", location: a.location ?? "",
          service: a.service ?? "", sessionType: a.session_type ?? "", notes: a.internal_notes ?? "", status: a.status,
        },
      };
    }
  } else if (sp.new === "1") {
    const fromId = sp.from && /^[0-9a-f-]{36}$/.test(sp.from) ? sp.from : null;
    const { data: r } = fromId ? await db.from("booking_requests").select("*").eq("id", fromId).maybeSingle() : { data: null };
    const at = isDateKey(sp.at) ? sp.at : isDateKey(r?.preferred_date) ? r!.preferred_date! : focus;
    const time = /^\d\d:\d\d$/.test(sp.time ?? "") ? sp.time! : (r?.preferred_time as string | undefined)?.slice(0, 5) ?? "10:00";
    panel = {
      title: r ? `New appointment for ${r.name}` : "New appointment",
      initial: {
        clientName: r?.name ?? "", clientPhone: r?.phone ?? "", clientEmail: r?.email ?? "", date: at, time,
        duration: settings.durations[1] ?? settings.durations[0], source: "whatsapp", sourceOther: "", link: settings.meetingDefaults.whatsapp ?? "", location: "",
        service: r?.concern && serviceNames.includes(r.concern) ? r.concern : "", sessionType: "first_consultation", notes: r?.message ?? "", status: "scheduled", requestId: r?.id,
      },
    };
  }

  const closeHref = `/admin/bookings?view=${view}&date=${focus}`;
  const existing = panel?.existing as { id: string; status: string; client_email: string | null; cancel_reason: string | null; reference: string; starts_at: string; meeting_source: string } | undefined;

  return (
    <>
      <PageTitle
        title="Bookings"
        intro="Your private calendar. Visitors never see this page or your availability."
        actions={<Link href={`/admin/bookings?view=${view}&date=${focus}&new=1`} className={btnPrimary}>+ New appointment</Link>}
      />
      {sp.sent && <p role="status" className="mb-4 rounded-xl bg-mint-100 px-4 py-2.5 text-sm text-forest-800">{sp.sent === "email" ? "Appointment card emailed to the client." : sp.sent === "noemail" ? "This client has no email address. Add one and try again." : sp.sent === "failed" ? "The email could not be sent. Email sending may not be set up yet." : "Done."}</p>}
      <div className={panel ? "grid gap-5 xl:grid-cols-[1fr_420px]" : ""}>
        <div className="min-w-0 xl:order-1">
          <Calendar view={view} focus={focus} events={events} daysOff={settings.daysOff} today={today} />
        </div>
        {panel && (
          <aside className="space-y-4 xl:order-2">
            <Card title={panel.title} action={<Link href={closeHref} className="text-sm font-semibold text-forest-700 underline underline-offset-4">Close</Link>}>
              {existing && (
                <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                  <Badge status={existing.status} /> <span>Ref {existing.reference}</span> <span>· {fmtDateTime(existing.starts_at)} · {sourceLabel(existing.meeting_source)}</span>
                </div>
              )}
              <AppointmentForm key={panel.initial.id ?? "new"} initial={panel.initial} durations={settings.durations} defaults={settings.meetingDefaults} services={serviceNames} view={view} />
            </Card>

            {existing && (
              <>
                <Card title="Appointment card">
                  <p className="mb-3 text-sm text-ink-soft">A clean card for the client. It updates automatically if you reschedule or cancel (older versions are marked superseded).</p>
                  <div className="flex flex-wrap gap-2">
                    <a href={`/api/cards/${existing.id}`} target="_blank" className={btnSoft}>Preview</a>
                    <a href={`/api/cards/${existing.id}?download=1`} className={btnSoft}>Download PNG</a>
                    <a href={`/api/cards/${existing.id}?format=pdf`} className={btnSoft}>Download PDF</a>
                    <a href={`/api/cards/${existing.id}/ics`} className={btnSoft}>Calendar file</a>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={`/api/cards/${existing.id}/whatsapp`} target="_blank" className={btnPrimary}>Send via WhatsApp</a>
                    <form action={emailCard.bind(null, existing.id)}><button className={btnPrimary} disabled={!existing.client_email}>Send via email</button></form>
                  </div>
                  {!existing.client_email && <p className="mt-2 text-[13px] text-ink-soft">Add the client&apos;s email above to send by email.</p>}
                </Card>

                {existing.status !== "cancelled" && (
                  <Card title="Cancel this appointment">
                    <form action={cancelAppointment.bind(null, existing.id)} className="space-y-3">
                      <label className="block"><span className={labelCls}>Reason (optional)</span><input name="reason" className={inputCls} /></label>
                      <ConfirmButton message="Cancel this appointment? The card will be marked cancelled." className={btnDanger}>Cancel appointment</ConfirmButton>
                    </form>
                  </Card>
                )}
                {existing.cancel_reason && <p className="text-sm text-ink-soft">Cancelled because: {existing.cancel_reason}</p>}
                <form action={deleteAppointment.bind(null, existing.id)}>
                  <ConfirmButton message="Delete this appointment permanently?" className="text-sm font-semibold text-[#b4452a] underline underline-offset-4">Delete permanently</ConfirmButton>
                </form>
              </>
            )}
          </aside>
        )}
      </div>
    </>
  );
}
