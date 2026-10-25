import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { storagePublicUrl, supabaseConfigured } from "@/lib/supabase/env";
import type { PublicStory } from "@/lib/types";
import { serviceDetails, generalFaqs, type IconKey, type ServiceDetail } from "@/lib/content";
import { profile as seedProfile, socials as seedSocials, linkButtons as seedButtons, type LinkButton, type SocialKey } from "@/lib/seed";

// Public, cacheable reads. Admin actions call updateTag(...) so edits appear immediately.
// Every function falls back to the in-repo seed if the database is unreachable.

export type Profile = {
  name: string;
  experience: string;
  tagline: string;
  bio: string;
  aboutLong: string | null;
  photoUrl: string | null;
  photoAlt: string;
  email: string;
  phone: string;
  phoneHref: string;
  address: string | null;
  whatsappNumber: string | null;
};
export type Social = { key: SocialKey; label: string; href: string };
export type { PublicStory };
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export async function getProfile(): Promise<Profile> {
  "use cache";
  cacheTag("profile");
  cacheLife("hours");
  const fallback: Profile = { ...seedProfile, aboutLong: null, whatsappNumber: null };
  if (!supabaseConfigured) return fallback;
  const { data } = await createPublicClient().from("profile").select("*").eq("id", 1).maybeSingle();
  if (!data) return fallback;
  return {
    name: data.name,
    experience: data.experience_line,
    tagline: data.tagline,
    bio: data.bio,
    aboutLong: data.about_long,
    photoUrl: data.photo_path ? storagePublicUrl("profile", data.photo_path) : null,
    photoAlt: data.photo_alt || `Portrait of ${data.name}`,
    email: data.contact_email,
    phone: data.contact_phone,
    phoneHref: telHref(data.contact_phone),
    address: data.address,
    whatsappNumber: data.whatsapp_number,
  };
}

type LinkRow = { kind: "social" | "button"; key: string; label: string; url: string | null; action: string; sort_order: number };

async function readLinks(): Promise<LinkRow[] | null> {
  if (!supabaseConfigured) return null;
  const { data } = await createPublicClient().from("links").select("kind,key,label,url,action,sort_order").order("sort_order");
  return data?.length ? (data as LinkRow[]) : null;
}

export async function getSocials(): Promise<Social[]> {
  "use cache";
  cacheTag("links");
  cacheLife("hours");
  const rows = await readLinks();
  if (!rows) return seedSocials;
  return rows.filter((r) => r.kind === "social" && r.url).map((r) => ({ key: r.key as SocialKey, label: r.label, href: r.url! }));
}

export async function getLinkButtons(): Promise<LinkButton[]> {
  "use cache";
  cacheTag("links");
  cacheLife("hours");
  const rows = await readLinks();
  if (!rows) return seedButtons;
  return rows
    .filter((r) => r.kind === "button")
    .flatMap((r): LinkButton[] => {
      if (r.action === "about") return [{ id: r.key, label: r.label, kind: "about" }];
      if (r.action === "services") return [{ id: r.key, label: r.label, kind: "services" }];
      if (r.action === "contact") return [{ id: r.key, label: r.label, kind: "contact" }];
      if (r.action === "stories") return [{ id: r.key, label: r.label, kind: "link", href: "/stories" }];
      return r.url ? [{ id: r.key, label: r.label, kind: "link", href: r.url }] : [];
    });
}

export async function getWhatsappHref(): Promise<string> {
  const socials = await getSocials();
  return socials.find((s) => s.key === "whatsapp")?.href ?? seedSocials.find((s) => s.key === "whatsapp")!.href;
}

export async function getServices(): Promise<ServiceDetail[]> {
  "use cache";
  cacheTag("services");
  cacheLife("hours");
  if (!supabaseConfigured) return serviceDetails;
  const { data } = await createPublicClient().from("services").select("*").order("sort_order");
  if (!data?.length) return serviceDetails;
  return data.map((s) => ({
    slug: s.slug,
    icon: s.icon as IconKey,
    title: s.title,
    short: s.short,
    intro: s.intro,
    whoFor: s.who_for ?? [],
    approach: s.approach ?? [],
    youGet: s.you_get ?? [],
    faqs: (s.faqs as { q: string; a: string }[]) ?? [],
  }));
}

export async function getFaqs(): Promise<{ q: string; a: string }[]> {
  "use cache";
  cacheTag("faqs");
  cacheLife("hours");
  if (!supabaseConfigured) return generalFaqs;
  const { data } = await createPublicClient().from("faqs").select("question,answer").order("sort_order");
  return data?.length ? data.map((f) => ({ q: f.question, a: f.answer })) : generalFaqs;
}

type StoryRow = {
  id: string; type: "review" | "story"; display_name: string; rating: number | null; body: string; result_summary: string | null;
  featured: boolean; created_at: string; images: PublicStory["images"] | null;
};
const toStory = (r: StoryRow): PublicStory => ({
  id: r.id, type: r.type, name: r.display_name, rating: r.rating ?? undefined, text: r.body, result: r.result_summary ?? undefined,
  date: r.created_at, images: r.images ?? [], featured: r.featured,
});

/** Stories shown on the home page: approved AND featured, in the admin's order. */
export async function getFeaturedStories(): Promise<PublicStory[]> {
  "use cache";
  cacheTag("stories");
  cacheLife("minutes");
  if (!supabaseConfigured) return [];
  const { data } = await createPublicClient().from("public_submissions").select("*").eq("featured", true).order("featured_order", { ascending: true, nullsFirst: false }).limit(6);
  return (data as StoryRow[] | null)?.map(toStory) ?? [];
}

/** All approved stories/reviews, newest first. */
export async function getApprovedStories(): Promise<PublicStory[]> {
  "use cache";
  cacheTag("stories");
  cacheLife("minutes");
  if (!supabaseConfigured) return [];
  const { data } = await createPublicClient().from("public_submissions").select("*").order("created_at", { ascending: false }).limit(200);
  return (data as StoryRow[] | null)?.map(toStory) ?? [];
}
