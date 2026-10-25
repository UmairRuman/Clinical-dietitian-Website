import "server-only";
import { updateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type SubmissionStatus = "pending" | "approved" | "featured" | "rejected" | "hidden" | "deleted";
const isPublic = (s: SubmissionStatus) => s === "approved" || s === "featured";

/** Image files live in a private bucket until the story is public, then move to the public one (and back if it's taken down). */
async function moveImages(submissionId: string, toPublic: boolean) {
  const db = createAdminClient();
  const { data } = await db.from("submission_images").select("path").eq("submission_id", submissionId);
  const from = toPublic ? "stories-pending" : "stories";
  const to = toPublic ? "stories" : "stories-pending";
  await Promise.all((data ?? []).map((i) => db.storage.from(from).move(i.path, i.path, { destinationBucket: to })));
}

export async function transition(id: string, next: SubmissionStatus, opts: { reason?: string | null } = {}) {
  const db = createAdminClient();
  const { data: cur } = await db.from("submissions").select("status").eq("id", id).maybeSingle();
  if (!cur) return;
  const prev = cur.status as SubmissionStatus;

  if (isPublic(prev) !== isPublic(next)) await moveImages(id, isPublic(next));

  const patch: Record<string, unknown> = { status: next };
  if (next === "deleted") patch.deleted_at = new Date().toISOString();
  else patch.deleted_at = null;
  if (next === "rejected") patch.rejection_reason = opts.reason ?? null;
  if (next === "featured") {
    const { data: last } = await db.from("submissions").select("featured_order").eq("status", "featured").order("featured_order", { ascending: false, nullsFirst: false }).limit(1);
    patch.featured_order = (last?.[0]?.featured_order ?? -1) + 1;
  } else patch.featured_order = null;

  await db.from("submissions").update(patch).eq("id", id);
  updateTag("stories");
}
