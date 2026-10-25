"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/server/auth";

export async function moveFeatured(id: string, dir: "up" | "down"): Promise<void> {
  await requireAdmin();
  const db = createAdminClient();
  const { data } = await db.from("submissions").select("id").eq("status", "featured").order("featured_order", { ascending: true, nullsFirst: false });
  if (!data) return;
  const i = data.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= data.length) return;
  const next = [...data];
  [next[i], next[j]] = [next[j], next[i]];
  await Promise.all(next.map((r, idx) => db.from("submissions").update({ featured_order: idx }).eq("id", r.id)));
  updateTag("stories");
  revalidatePath("/admin/curation");
}
