"use server";

import { randomUUID } from "node:crypto";
import { submissionSchema, MAX_PHOTOS, PHOTO_TYPES } from "@/lib/schemas/submission";
import { cleanText, publicDisplayName } from "@/lib/text";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailLayout, sendEmail } from "@/server/email";
import { ImageError, processImage } from "@/server/images";
import { clientIp, rateLimit } from "@/server/rate-limit";
import { verifyTurnstile } from "@/server/turnstile";

export type SubmissionResult = { ok: true } | { ok: false; error: string };

/** Visitor review / success story: saved as PENDING (invisible to the public) and the admin is notified. */
export async function submitStory(formData: FormData): Promise<SubmissionResult> {
  const raw = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string"));
  const parsed = submissionSchema.safeParse({
    ...raw,
    consent: raw.consent === "true",
    photoConsent: raw.photoConsent === "true",
  });
  if (!parsed.success) return { ok: false, error: "Please check the form and try again." };
  const v = parsed.data;
  if (v.website) return { ok: true }; // honeypot

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_PHOTOS) return { ok: false, error: `Up to ${MAX_PHOTOS} photos only.` };
  if (files.some((f) => f.type && !PHOTO_TYPES.includes(f.type))) return { ok: false, error: "Photos must be JPG, PNG or WebP." };
  if (files.length && !v.photoConsent) return { ok: false, error: "Please confirm photo consent." };

  const ip = await clientIp();
  if (!(await rateLimit(`story:${ip}`, 3, 3600))) return { ok: false, error: "You have submitted a few times already. Please try again later." };
  if (!(await verifyTurnstile(formData.get("turnstileToken")?.toString(), ip))) return { ok: false, error: "We could not verify you are human. Please refresh and try again." };

  // Process every image BEFORE writing anything, so a bad file leaves no partial submission.
  let processed: Awaited<ReturnType<typeof processImage>>[] = [];
  try {
    processed = await Promise.all(files.map((f) => processImage(f, { maxSide: 1600 })));
  } catch (err) {
    return { ok: false, error: err instanceof ImageError ? err.message : "We could not process your photos." };
  }

  const db = createAdminClient();
  const id = randomUUID();
  const realName = cleanText(v.name);
  const body = cleanText(v.body, { multiline: true });

  const { error } = await db.from("submissions").insert({
    id,
    type: v.type,
    real_name: realName,
    display_name: publicDisplayName(realName, v.namePref),
    name_pref: v.namePref,
    private_contact: cleanText(v.contact),
    rating: v.type === "review" ? v.rating : null,
    body,
    original_body: body,
    result_summary: v.type === "story" && v.result ? cleanText(v.result) : null,
    consent_publish: true,
    consent_photos: Boolean(v.photoConsent && files.length),
    status: "pending",
  });
  if (error) {
    console.error("[story] insert failed", error.message);
    return { ok: false, error: "Something went wrong saving your submission. Please try again." };
  }

  const uploaded: string[] = [];
  for (const [i, img] of processed.entries()) {
    const path = `${id}/${i + 1}-${randomUUID().slice(0, 8)}.webp`;
    const up = await db.storage.from("stories-pending").upload(path, img.buffer, { contentType: "image/webp", upsert: false, cacheControl: "300" });
    if (up.error) {
      console.error("[story] upload failed", up.error.message);
      continue;
    }
    uploaded.push(path);
    await db.from("submission_images").insert({ submission_id: id, path, width: img.width, height: img.height, sort_order: i });
  }

  const { data: settings } = await db.from("settings").select("notification_email").eq("id", 1).maybeSingle();
  await sendEmail({
    to: settings?.notification_email || "naseembushra383@gmail.com",
    subject: `New ${v.type === "review" ? "review" : "success story"} awaiting approval`,
    html: emailLayout(`New ${v.type} from ${realName}`, [
      ["Shown as", publicDisplayName(realName, v.namePref)],
      ["Rating", v.rating ? `${v.rating} / 5` : "-"],
      ["Text", body],
      ["Photos", String(uploaded.length)],
    ], "Open the admin portal > Reviews & stories to approve, edit or reject it."),
  });
  return { ok: true };
}
