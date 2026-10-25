import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Daily job: permanently removes reviews/stories that were deleted more than 30 days ago (spec §8.3),
 * along with their photos. Protected by CRON_SECRET (Vercel Cron sends it as a Bearer token).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new NextResponse("Unauthorized", { status: 401 });

  const db = createAdminClient();
  const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data: old } = await db.from("submissions").select("id").eq("status", "deleted").lt("deleted_at", cutoff);
  const ids = (old ?? []).map((s) => s.id);

  if (ids.length) {
    const { data: imgs } = await db.from("submission_images").select("path").in("submission_id", ids);
    const paths = (imgs ?? []).map((i) => i.path);
    if (paths.length) {
      await db.storage.from("stories").remove(paths);
      await db.storage.from("stories-pending").remove(paths);
    }
    await db.from("submissions").delete().in("id", ids); // submission_images cascade
  }
  return NextResponse.json({ purged: ids.length });
}
