"use server";

import { randomUUID } from "node:crypto";
import { updateTag } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/components/admin/forms";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanText } from "@/lib/text";
import { ImageError, processImage } from "@/server/images";
import { requireAdmin } from "@/server/auth";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  experience: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(2).max(120),
  bio: z.string().trim().min(10).max(600),
  photoAlt: z.string().trim().max(200).optional(),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(30),
  whatsapp: z.string().trim().max(30).optional(),
  address: z.string().trim().max(240).optional(),
});

export async function saveProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const v = parsed.data;
  const { error } = await createAdminClient()
    .from("profile")
    .update({
      name: cleanText(v.name),
      experience_line: cleanText(v.experience),
      tagline: cleanText(v.tagline),
      bio: cleanText(v.bio, { multiline: true }),
      photo_alt: v.photoAlt ? cleanText(v.photoAlt) : null,
      contact_email: v.email,
      contact_phone: cleanText(v.phone),
      whatsapp_number: v.whatsapp ? cleanText(v.whatsapp) : null,
      address: v.address ? cleanText(v.address) : null,
    })
    .eq("id", 1);
  if (error) return { error: "Could not save. Please try again." };
  updateTag("profile");
  return { ok: true, message: "Saved. The website is updated." };
}

const KEEP_PHOTOS = 5;

async function setCurrent(photoId: string, path: string) {
  const db = createAdminClient();
  await db.from("profile_photos").update({ is_current: false }).eq("is_current", true);
  await db.from("profile_photos").update({ is_current: true }).eq("id", photoId);
  await db.from("profile").update({ photo_path: path }).eq("id", 1);
}

export async function uploadPhoto(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const file = formData.get("photo");
  if (!(file instanceof File)) return { error: "Choose a photo first." };
  try {
    const img = await processImage(file, { maxSide: 900, square: true, quality: 86 });
    const db = createAdminClient();
    const path = `${randomUUID()}.webp`;
    const up = await db.storage.from("profile").upload(path, img.buffer, { contentType: "image/webp", cacheControl: "31536000" });
    if (up.error) return { error: "Upload failed. Please try again." };
    const { data: row, error } = await db.from("profile_photos").insert({ path, is_current: false }).select("id").single();
    if (error || !row) return { error: "Could not save the photo record." };
    await setCurrent(row.id, path);

    // keep the latest 5 (always including the current one)
    const { data: all } = await db.from("profile_photos").select("id,path,is_current").order("created_at", { ascending: false });
    const stale = (all ?? []).filter((p, i) => i >= KEEP_PHOTOS && !p.is_current);
    if (stale.length) {
      await db.storage.from("profile").remove(stale.map((p) => p.path));
      await db.from("profile_photos").delete().in("id", stale.map((p) => p.id));
    }
    updateTag("profile");
    return { ok: true, message: "New photo is live on the website." };
  } catch (err) {
    return { error: err instanceof ImageError ? err.message : "Could not process that photo." };
  }
}

export async function restorePhoto(photoId: string): Promise<void> {
  await requireAdmin();
  const { data } = await createAdminClient().from("profile_photos").select("path").eq("id", photoId).maybeSingle();
  if (!data) return;
  await setCurrent(photoId, data.path);
  updateTag("profile");
}
