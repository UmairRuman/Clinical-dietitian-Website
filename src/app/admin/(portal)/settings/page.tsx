import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { inputCls, labelCls } from "@/components/admin/styles";
import { Card, PageTitle } from "@/components/admin/ui";
import { requireFullAdmin } from "@/server/auth";
import { DAYS, getSettings } from "@/server/settings";
import { saveSettings } from "./actions";

export const metadata = { title: "Settings" };

// Private admin page: waits for the session by design.
export const instant = false;

export default async function SettingsPage() {
  await requireFullAdmin();
  const s = await getSettings();
  return (
    <>
      <PageTitle title="Settings" intro="Working hours, session lengths, meeting links and the email address that receives notifications." />
      <ActionForm action={saveSettings} className="space-y-5">
        <Card title="Notifications">
          <label className="block max-w-[420px]">
            <span className={labelCls}>Send alerts to</span>
            <input name="notificationEmail" type="email" defaultValue={s.notificationEmail} required className={inputCls} />
          </label>
          <p className="mt-2 text-sm text-ink-soft">New booking requests and new reviews are emailed here.</p>
        </Card>

        <Card title="Working hours (Pakistan time)">
          <ul className="space-y-2.5">
            {DAYS.map(([k, label]) => (
              <li key={k} className="grid grid-cols-[120px_auto_1fr] items-center gap-3 sm:grid-cols-[140px_90px_1fr]">
                <span className="font-semibold">{label}</span>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name={`${k}_open`} defaultChecked={s.workingHours[k].open} className="size-5 accent-[#2f6b45]" /> Open</label>
                <span className="flex items-center gap-2">
                  <input name={`${k}_start`} type="time" defaultValue={s.workingHours[k].start} className={`${inputCls} !w-[120px]`} />
                  <span className="text-ink-soft">to</span>
                  <input name={`${k}_end`} type="time" defaultValue={s.workingHours[k].end} className={`${inputCls} !w-[120px]`} />
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block"><span className={labelCls}>Session lengths (minutes)</span><input name="durations" defaultValue={s.durations.join(", ")} className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Buffer between sessions (minutes)</span><input name="bufferMin" type="number" min={0} max={120} defaultValue={s.bufferMin} className={inputCls} /></label>
          </div>
          <label className="mt-4 block">
            <span className={labelCls}>Days off / blocked dates (one per line, YYYY-MM-DD)</span>
            <textarea name="daysOff" rows={3} defaultValue={s.daysOff.join("\n")} className={inputCls} placeholder="2026-12-25" />
          </label>
        </Card>

        <Card title="Default meeting links">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className={labelCls}>Microsoft Teams</span><input name="default_teams" defaultValue={s.meetingDefaults.teams ?? ""} className={inputCls} placeholder="https://teams.microsoft.com/…" /></label>
            <label className="block"><span className={labelCls}>Zoom</span><input name="default_zoom" defaultValue={s.meetingDefaults.zoom ?? ""} className={inputCls} placeholder="https://zoom.us/j/…" /></label>
            <label className="block"><span className={labelCls}>Google Meet</span><input name="default_google_meet" defaultValue={s.meetingDefaults.google_meet ?? ""} className={inputCls} placeholder="https://meet.google.com/…" /></label>
            <label className="block"><span className={labelCls}>WhatsApp</span><input name="default_whatsapp" defaultValue={s.meetingDefaults.whatsapp ?? ""} className={inputCls} placeholder="https://wa.me/…" /></label>
            <label className="block sm:col-span-2"><span className={labelCls}>Clinic address (for office visits)</span><input name="default_office" defaultValue={s.meetingDefaults.office ?? ""} className={inputCls} /></label>
          </div>
        </Card>

        <Card title="Appointment card">
          <label className="block"><span className={labelCls}>Note printed on every card</span><textarea name="cardText" rows={2} defaultValue={s.cardText} className={inputCls} /></label>
        </Card>

        <div className="flex items-center gap-4">
          <SubmitButton>Save settings</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
