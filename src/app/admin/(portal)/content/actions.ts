"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/components/admin/forms";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanText } from "@/lib/text";
import { requireAdmin } from "@/server/auth";

const lines = (s: FormDataEntryValue | null) =>
  String(s ?? "")
    .split(/\r?\n/)
    .map((l) => cleanText(l))
    .filter(Boolean);

/** "Q: question\nA: answer" blocks separated by a blank line */
export async function parseFaqs(text: string): Promise<{ q: string; a: string }[]> {
  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const q = block.match(/^\s*Q:\s*(.+)$/im)?.[1];
      const a = block.match(/^\s*A:\s*([\s\S]+)$/im)?.[1];
      return q && a ? { q: cleanText(q), a: cleanText(a, { multiline: true }) } : null;
    })
    .filter((x): x is { q: string; a: string } => x !== null);
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "service";

function done(tag: "services" | "faqs" | "profile") {
  updateTag(tag);
  revalidatePath("/admin/content");
}

// ───────────── About ─────────────
export async function saveAbout(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const text = z.string().max(4000).safeParse(formData.get("about"));
  if (!text.success) return { error: "That text is too long (4000 characters max)." };
  const clean = cleanText(text.data, { multiline: true });
  const { error } = await createAdminClient().from("profile").update({ about_long: clean || null }).eq("id", 1);
  if (error) return { error: "Could not save." };
  done("profile");
  return { ok: true, message: "About page updated." };
}

// ───────────── FAQs ─────────────
const faqSchema = z.object({ question: z.string().trim().min(3).max(200), answer: z.string().trim().min(3).max(1500), visible: z.string().optional() });

export async function saveFaq(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = faqSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return { error: "Both the question and the answer are needed." };
  const { error } = await createAdminClient().from("faqs").update({ question: cleanText(p.data.question), answer: cleanText(p.data.answer, { multiline: true }), visible: p.data.visible === "on" }).eq("id", id);
  if (error) return { error: "Could not save." };
  done("faqs");
  return { ok: true, message: "Saved." };
}

export async function addFaq(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = faqSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return { error: "Both the question and the answer are needed." };
  const db = createAdminClient();
  const { data: last } = await db.from("faqs").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const { error } = await db.from("faqs").insert({ question: cleanText(p.data.question), answer: cleanText(p.data.answer, { multiline: true }), sort_order: (last?.[0]?.sort_order ?? -1) + 1 });
  if (error) return { error: "Could not add." };
  done("faqs");
  return { ok: true, message: "FAQ added." };
}

export async function deleteFaq(id: string): Promise<void> {
  await requireAdmin();
  await createAdminClient().from("faqs").delete().eq("id", id);
  done("faqs");
}

async function swap(table: "faqs" | "services", id: string, dir: "up" | "down") {
  const db = createAdminClient();
  const { data } = await db.from(table).select("id,sort_order").order("sort_order");
  if (!data) return;
  const i = data.findIndex((r) => r.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= data.length) return;
  const next = [...data];
  [next[i], next[j]] = [next[j], next[i]];
  await Promise.all(next.map((r, idx) => db.from(table).update({ sort_order: idx }).eq("id", r.id)));
}

export async function moveFaq(id: string, dir: "up" | "down"): Promise<void> {
  await requireAdmin();
  await swap("faqs", id, dir);
  done("faqs");
}

// ───────────── Services ─────────────
const ICONS = ["weight", "diabetes", "uric", "pressure", "sports", "pcos"] as const;
const serviceSchema = z.object({
  title: z.string().trim().min(2).max(80),
  short: z.string().trim().min(5).max(200),
  icon: z.enum(ICONS),
  intro: z.string().trim().min(10).max(800),
});

export async function saveService(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Please check the form." };
  const faqs = await parseFaqs(String(formData.get("faqs") ?? ""));
  const { error } = await createAdminClient()
    .from("services")
    .update({
      title: cleanText(p.data.title),
      short: cleanText(p.data.short),
      icon: p.data.icon,
      intro: cleanText(p.data.intro, { multiline: true }),
      who_for: lines(formData.get("whoFor")),
      approach: lines(formData.get("approach")),
      you_get: lines(formData.get("youGet")),
      faqs,
      visible: formData.get("visible") === "on",
    })
    .eq("id", id);
  if (error) return { error: "Could not save." };
  done("services");
  return { ok: true, message: "Service page updated." };
}

export async function addService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const title = z.string().trim().min(2).max(80).safeParse(formData.get("title"));
  if (!title.success) return { error: "Enter a service name." };
  const db = createAdminClient();
  let slug = slugify(title.data);
  const { data: existing } = await db.from("services").select("slug").like("slug", `${slug}%`);
  if (existing?.some((s) => s.slug === slug)) slug = `${slug}-${existing.length + 1}`;
  const { data: last } = await db.from("services").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const { data, error } = await db
    .from("services")
    .insert({ slug, title: cleanText(title.data), short: "Short description goes here.", icon: "weight", intro: "Describe this service here.", visible: false, sort_order: (last?.[0]?.sort_order ?? -1) + 1 })
    .select("id")
    .single();
  if (error || !data) return { error: "Could not add the service." };
  done("services");
  redirect(`/admin/content/services/${data.id}`);
}

export async function deleteService(id: string): Promise<void> {
  await requireAdmin();
  await createAdminClient().from("services").delete().eq("id", id);
  done("services");
  redirect("/admin/content");
}

export async function moveService(id: string, dir: "up" | "down"): Promise<void> {
  await requireAdmin();
  await swap("services", id, dir);
  done("services");
}
