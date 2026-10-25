"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/components/admin/forms";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDateTime, isDateKey, parsePkt } from "@/lib/dates";
import { cleanText } from "@/lib/text";
import { bumpCard, findConflicts } from "@/server/appointments";
import { requireAdmin, requireFullAdmin } from "@/server/auth";

export type AppointmentState = (ActionState & { needsOverride?: boolean }) | null;

const SOURCE = ["teams", "whatsapp", "zoom", "google_meet", "voice_call", "office", "other"] as const;
const STATUS = ["scheduled", "confirmed", "completed", "cancelled", "no_show"] as const;

const schema = z.object({
  clientName: z.string().trim().min(1, "Enter the client's name").max(80),
  clientPhone: z.string().trim().min(7, "Enter a phone / WhatsApp number").max(30),
  clientEmail: z.union([z.literal(""), z.string().trim().email("Enter a valid email or leave it blank")]).optional(),
  date: z.string().refine(isDateKey, "Choose a date"),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a start time"),
  duration: z.coerce.number().int().min(5).max(480),
  source: z.enum(SOURCE),
  sourceOther: z.string().trim().max(60).optional(),
  link: z.string().trim().max(500).refine((u) => u === "" || /^https?:\/\//i.test(u), "Meeting links must start with https://").optional(),
  location: z.string().trim().max(240).optional(),
  service: z.string().trim().max(80).optional(),
  sessionType: z.enum(["", "first_consultation", "follow_up"]).optional(),
  notes: z.string().trim().max(2000).optional(),
  status: z.enum(STATUS),
  override: z.string().optional(),
  requestId: z.string().uuid().optional().or(z.literal("")),
  view: z.string().optional(),
});

function refresh() {
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

export async function saveAppointment(id: string | null, _prev: AppointmentState, formData: FormData): Promise<AppointmentState> {
  await requireAdmin();
  const p = schema.safeParse(Object.fromEntries(formData));
  if (!p.success) return { error: p.error.issues[0].message };
  const v = p.data;
  const start = parsePkt(v.date, v.time);

  if (v.status !== "cancelled" && v.override !== "on") {
    const conflicts = await findConflicts(start, v.duration, id ?? undefined);
    if (conflicts.length) return { error: `${conflicts.join(". ")}.`, needsOverride: true };
  }

  const db = createAdminClient();
  const row = {
    client_name: cleanText(v.clientName),
    client_phone: cleanText(v.clientPhone),
    client_email: v.clientEmail ? v.clientEmail : null,
    starts_at: start.toISOString(),
    duration_min: v.duration,
    meeting_source: v.source,
    meeting_source_other: v.source === "other" && v.sourceOther ? cleanText(v.sourceOther) : null,
    meeting_link: v.link ? v.link : null,
    location: v.location ? cleanText(v.location) : null,
    service: v.service ? cleanText(v.service) : null,
    session_type: v.sessionType ? v.sessionType : null,
    internal_notes: v.notes ? cleanText(v.notes, { multiline: true }) : null,
    status: v.status,
  };

  let savedId = id;
  if (id) {
    const { data: before } = await db.from("appointments").select("starts_at,duration_min,meeting_source,meeting_link,location,status").eq("id", id).maybeSingle();
    const { error } = await db.from("appointments").update(row).eq("id", id);
    if (error) return { error: "Could not save the appointment." };
    const changed =
      !before ||
      new Date(before.starts_at).getTime() !== start.getTime() ||
      before.duration_min !== v.duration ||
      before.meeting_source !== v.source ||
      before.meeting_link !== row.meeting_link ||
      before.location !== row.location ||
      before.status !== v.status;
    if (changed) await bumpCard(id);
  } else {
    const { data, error } = await db.from("appointments").insert({ ...row, request_id: v.requestId || null }).select("id").single();
    if (error || !data) return { error: "Could not create the appointment." };
    savedId = data.id;
    await bumpCard(data.id);
    if (v.requestId) await db.from("booking_requests").update({ status: "converted" }).eq("id", v.requestId);
    revalidatePath("/admin/requests");
  }
  refresh();
  redirect(`/admin/bookings?view=${v.view || "month"}&date=${v.date}&edit=${savedId}`);
}

export async function cancelAppointment(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const reason = cleanText(String(formData.get("reason") ?? "")).slice(0, 300) || null;
  await createAdminClient().from("appointments").update({ status: "cancelled", cancel_reason: reason }).eq("id", id);
  await bumpCard(id);
  refresh();
  redirect(`/admin/bookings?edit=${id}`);
}

export async function deleteAppointment(id: string): Promise<void> {
  await requireFullAdmin();
  await createAdminClient().from("appointments").delete().eq("id", id);
  refresh();
  redirect("/admin/bookings");
}

/** Drag-to-reschedule. Returns conflicts so the UI can ask before overriding. */
export async function rescheduleAppointment(id: string, newStartIso: string, override: boolean): Promise<{ ok: boolean; conflicts?: string[]; error?: string; label?: string }> {
  await requireAdmin();
  const start = new Date(newStartIso);
  if (Number.isNaN(start.getTime())) return { ok: false, error: "Invalid time." };
  const db = createAdminClient();
  const { data: a } = await db.from("appointments").select("duration_min").eq("id", id).maybeSingle();
  if (!a) return { ok: false, error: "Appointment not found." };
  if (!override) {
    const conflicts = await findConflicts(start, a.duration_min, id);
    if (conflicts.length) return { ok: false, conflicts };
  }
  const { error } = await db.from("appointments").update({ starts_at: start.toISOString() }).eq("id", id);
  if (error) return { ok: false, error: "Could not reschedule." };
  await bumpCard(id);
  refresh();
  return { ok: true, label: fmtDateTime(start) };
}
