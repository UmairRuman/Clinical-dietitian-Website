import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtTime, pktDateKey, pktParts } from "@/lib/dates";
import { type DayKey, getSettings } from "@/server/settings";

const DOW_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** Human-readable reasons this slot needs a second look. Empty = clear. */
export async function findConflicts(start: Date, durationMin: number, excludeId?: string): Promise<string[]> {
  const db = createAdminClient();
  const settings = await getSettings();
  const end = new Date(start.getTime() + durationMin * 60_000);
  const buffer = settings.bufferMin * 60_000;
  const out: string[] = [];

  const { data } = await db
    .from("appointments")
    .select("id,client_name,starts_at,ends_at")
    .neq("status", "cancelled")
    .lt("starts_at", new Date(end.getTime() + buffer).toISOString())
    .gt("ends_at", new Date(start.getTime() - buffer).toISOString());
  for (const a of data ?? []) {
    if (a.id === excludeId) continue;
    const s = new Date(a.starts_at);
    const e = new Date(a.ends_at);
    const overlaps = s < end && e > start;
    out.push(
      overlaps
        ? `Overlaps with ${a.client_name} (${fmtTime(s)} to ${fmtTime(e)})`
        : `Less than ${settings.bufferMin} minutes from ${a.client_name} (${fmtTime(s)} to ${fmtTime(e)})`,
    );
  }

  const p = pktParts(start);
  const key = pktDateKey(start);
  const hours = settings.workingHours[DOW_KEYS[p.dow]];
  if (settings.daysOff.includes(key)) out.push("This date is marked as a day off");
  else if (!hours.open) out.push("You are not normally open on this day");
  else {
    const hhmm = `${String(p.h).padStart(2, "0")}:${String(p.min).padStart(2, "0")}`;
    const endP = pktParts(end);
    const endHhmm = `${String(endP.h).padStart(2, "0")}:${String(endP.min).padStart(2, "0")}`;
    if (hhmm < hours.start || endHhmm > hours.end) out.push(`Outside your working hours (${hours.start} to ${hours.end})`);
  }
  return out;
}

/** A new card version is issued whenever anything the client sees changes; older versions are marked superseded. */
export async function bumpCard(appointmentId: string) {
  const db = createAdminClient();
  const { data } = await db.from("appointment_cards").select("version").eq("appointment_id", appointmentId).order("version", { ascending: false }).limit(1);
  await db.from("appointment_cards").update({ superseded_at: new Date().toISOString() }).eq("appointment_id", appointmentId).is("superseded_at", null);
  await db.from("appointment_cards").insert({ appointment_id: appointmentId, version: (data?.[0]?.version ?? 0) + 1 });
}
