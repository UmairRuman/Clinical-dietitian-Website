"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/components/admin/forms";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanText } from "@/lib/text";
import { ImageError, processImage } from "@/server/images";
import { requireAdmin, requireFullAdmin } from "@/server/auth";
import { transition } from "@/server/submissions";

const refresh = () => revalidatePath("/admin/moderation");

export async function approve(id: string) { await requireAdmin(); await transition(id, "approved"); refresh(); }
export async function hide(id: string) { await requireAdmin(); await transition(id, "hidden"); refresh(); }
export async function restore(id: string) { await requireAdmin(); await transition(id, "pending"); refresh(); }
export async function feature(id: string) { await requireAdmin(); await transition(id, "featured"); refresh(); }
export async function unfeature(id: string) { await requireAdmin(); await transition(id, "approved"); refresh(); }
export async function remove(id: string) { await requireFullAdmin(); await transition(id, "deleted"); refresh(); }

export async function reject(id: string, formData: FormData) {
  await requireAdmin();
  const reason = cleanText(String(formData.get("reason") ?? "")).slice(0, 300) || null;
  await transition(id, "rejected", { reason });
  refresh();
}

function idsFrom(formData: FormData) {
  return formData.getAll("ids").map(String).filter((s) => /^[0-9a-f-]{36}$/.test(s));
}
export async function bulkApprove(formData: FormData) {
  await requireAdmin();
  for (const id of idsFrom(formData)) await transition(id, "approved");
  refresh();
}
export async function bulkReject(formData: FormData) {
  await requireAdmin();
  for (const id of idsFrom(formData)) await transition(id, "rejected", { reason: null });
  refresh();
}

const editSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  body: z.string().trim().min(30, "The text needs at least 30 characters.").max(1000, "The text can be at most 1000 characters."),
  result: z.string().trim().max(80).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional().or(z.literal("")),
});

/** Edit before/after approving (fix typos, remove phone numbers). The original text is kept. */
export async function saveSubmission(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = editSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return { error: p.error.issues[0].message };
  const db = createAdminClient();
  const { data: cur } = await db.from("submissions").select("type").eq("id", id).maybeSingle();
  if (!cur) return { error: "Not found." };
  const { error } = await db
    .from("submissions")
    .update({
      display_name: cleanText(p.data.displayName),
      body: cleanText(p.data.body, { multiline: true }),
      result_summary: p.data.result ? cleanText(p.data.result) : null,
      rating: cur.type === "review" && typeof p.data.rating === "number" ? p.data.rating : null,
    })
    .eq("id", id);
  if (error) return { error: "Could not save." };
  updateTag("stories");
  refresh();
  return { ok: true, message: "Saved." };
}

const manualSchema = z.object({
  type: z.enum(["review", "story"]),
  name: z.string().trim().min(1, "Enter the client's display name").max(60),
  body: z.string().trim().min(30, "The text needs at least 30 characters.").max(1000),
  result: z.string().trim().max(80).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional().or(z.literal("")),
});

/** Admin adds a story herself (e.g. from a WhatsApp screenshot). Goes live immediately. */
export async function addManualStory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = manualSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return { error: p.error.issues[0].message };
  if (p.data.type === "review" && typeof p.data.rating !== "number") return { error: "Choose a star rating for a review." };

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 3);
  let processed: Awaited<ReturnType<typeof processImage>>[] = [];
  try {
    processed = await Promise.all(files.map((f) => processImage(f, { maxSide: 1600 })));
  } catch (err) {
    return { error: err instanceof ImageError ? err.message : "Could not process the photos." };
  }

  const db = createAdminClient();
  const id = randomUUID();
  const body = cleanText(p.data.body, { multiline: true });
  const { error } = await db.from("submissions").insert({
    id,
    type: p.data.type,
    real_name: cleanText(p.data.name),
    display_name: cleanText(p.data.name),
    name_pref: "full",
    private_contact: "added by admin",
    rating: p.data.type === "review" ? p.data.rating : null,
    body,
    original_body: body,
    result_summary: p.data.result ? cleanText(p.data.result) : null,
    consent_publish: true,
    consent_photos: processed.length > 0,
    status: "approved",
  });
  if (error) return { error: "Could not add the story." };
  for (const [i, img] of processed.entries()) {
    const path = `${id}/${i + 1}-${randomUUID().slice(0, 8)}.webp`;
    const up = await db.storage.from("stories").upload(path, img.buffer, { contentType: "image/webp", cacheControl: "300" });
    if (!up.error) await db.from("submission_images").insert({ submission_id: id, path, width: img.width, height: img.height, sort_order: i });
  }
  updateTag("stories");
  refresh();
  return { ok: true, message: "Story added and published." };
}
