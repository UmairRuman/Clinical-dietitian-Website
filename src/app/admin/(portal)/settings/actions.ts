"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/components/admin/forms";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanText } from "@/lib/text";
import { requireFullAdmin } from "@/server/auth";
import { DAYS } from "@/server/settings";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use times like 09:30");
const url = z.string().trim().max(500).refine((u) => u === "" || /^https?:\/\//i.test(u), "Meeting links must start with https://");

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireFullAdmin();
  const email = z.string().trim().email("Enter a valid notification email").safeParse(formData.get("notificationEmail"));
  if (!email.success) return { error: email.error.issues[0].message };

  const workingHours: Record<string, { open: boolean; start: string; end: string }> = {};
  for (const [k, label] of DAYS) {
    const start = time.safeParse(formData.get(`${k}_start`));
    const end = time.safeParse(formData.get(`${k}_end`));
    if (!start.success || !end.success) return { error: `${label}: ${(start.error ?? end.error)!.issues[0].message}` };
    if (end.data <= start.data) return { error: `${label}: closing time must be after opening time.` };
    workingHours[k] = { open: formData.get(`${k}_open`) === "on", start: start.data, end: end.data };
  }

  const daysOff = String(formData.get("daysOff") ?? "")
    .split(/[\s,]+/)
    .filter(Boolean);
  if (daysOff.some((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d))) return { error: "Days off must be dates like 2026-12-25, one per line." };

  const durations = String(formData.get("durations") ?? "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  if (!durations.length || durations.some((d) => !Number.isInteger(d) || d < 5 || d > 240)) return { error: "Durations must be whole minutes, like 30, 45, 60." };

  const buffer = z.coerce.number().int().min(0).max(120).safeParse(formData.get("bufferMin"));
  if (!buffer.success) return { error: "Buffer must be between 0 and 120 minutes." };

  const defaults: Record<string, string> = {};
  for (const k of ["teams", "zoom", "google_meet", "whatsapp"] as const) {
    const u = url.safeParse(formData.get(`default_${k}`) ?? "");
    if (!u.success) return { error: u.error.issues[0].message };
    if (u.data) defaults[k] = u.data;
  }
  const office = cleanText(String(formData.get("default_office") ?? ""));
  if (office) defaults.office = office;

  const { error } = await createAdminClient()
    .from("settings")
    .update({
      notification_email: email.data,
      working_hours: workingHours,
      days_off: daysOff,
      durations: [...new Set(durations)].sort((a, b) => a - b),
      buffer_min: buffer.data,
      meeting_defaults: defaults,
      card_text: cleanText(String(formData.get("cardText") ?? ""), { multiline: true }).slice(0, 300),
    })
    .eq("id", 1);
  if (error) return { error: "Could not save settings." };
  revalidatePath("/admin/settings");
  return { ok: true, message: "Settings saved." };
}
