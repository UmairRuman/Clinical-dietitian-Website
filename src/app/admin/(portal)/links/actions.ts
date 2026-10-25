"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/components/admin/forms";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanText } from "@/lib/text";
import { requireAdmin } from "@/server/auth";

const CORE_ACTIONS = ["about", "services", "contact", "stories"];

// Only safe schemes: never javascript: / data:
const urlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((u) => /^(https?:\/\/|mailto:|tel:)/i.test(u) || (u.startsWith("/") && !u.startsWith("//")), "Use a full link starting with https://, mailto:, tel: or /");

const saveSchema = z.object({
  label: z.string().trim().min(1, "Give the link a label").max(60),
  url: z.string().optional(),
  visible: z.string().optional(),
});

function done() {
  updateTag("links");
  revalidatePath("/admin/links");
}

export async function saveLink(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = saveSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const db = createAdminClient();
  const { data: row } = await db.from("links").select("action").eq("id", id).maybeSingle();
  if (!row) return { error: "Link not found." };

  const patch: Record<string, unknown> = { label: cleanText(parsed.data.label), visible: parsed.data.visible === "on" };
  if (!CORE_ACTIONS.includes(row.action)) {
    const url = urlSchema.safeParse(parsed.data.url ?? "");
    if (!url.success) return { error: url.error.issues[0].message };
    patch.url = url.data;
  }
  const { error } = await db.from("links").update(patch).eq("id", id);
  if (error) return { error: "Could not save." };
  done();
  return { ok: true, message: "Saved." };
}

export async function moveLink(id: string, direction: "up" | "down"): Promise<void> {
  await requireAdmin();
  const db = createAdminClient();
  const { data: me } = await db.from("links").select("id,kind,sort_order").eq("id", id).maybeSingle();
  if (!me) return;
  const { data: siblings } = await db.from("links").select("id,sort_order").eq("kind", me.kind).order("sort_order");
  if (!siblings) return;
  const i = siblings.findIndex((s) => s.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= siblings.length) return;
  const reordered = [...siblings];
  [reordered[i], reordered[j]] = [reordered[j], reordered[i]];
  await Promise.all(reordered.map((s, idx) => db.from("links").update({ sort_order: idx }).eq("id", s.id)));
  done();
}

export async function addLink(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const label = z.string().trim().min(1, "Give the link a label").max(60).safeParse(formData.get("label"));
  if (!label.success) return { error: label.error.issues[0].message };
  const url = urlSchema.safeParse(formData.get("url") ?? "");
  if (!url.success) return { error: url.error.issues[0].message };
  const db = createAdminClient();
  const { data: last } = await db.from("links").select("sort_order").eq("kind", "button").order("sort_order", { ascending: false }).limit(1);
  const { error } = await db.from("links").insert({
    kind: "button",
    key: `custom-${Date.now().toString(36)}`,
    label: cleanText(label.data),
    url: url.data,
    action: "url",
    visible: true,
    sort_order: (last?.[0]?.sort_order ?? -1) + 1,
  });
  if (error) return { error: "Could not add the link." };
  done();
  return { ok: true, message: "Link added." };
}

export async function deleteLink(id: string): Promise<void> {
  await requireAdmin();
  const db = createAdminClient();
  const { data: row } = await db.from("links").select("kind,action,key").eq("id", id).maybeSingle();
  // built-in social icons and the four core buttons can be hidden but not deleted
  if (!row || row.kind === "social" || CORE_ACTIONS.includes(row.action)) return;
  await db.from("links").delete().eq("id", id);
  done();
}
