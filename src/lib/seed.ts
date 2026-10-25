import { serviceDetails } from "./content";

// Seed content from spec §2, §6, §10. Replaced by database reads in Milestone 2.

import { profile, socials, type SocialKey } from "./identity";

export { profile, socials };
export type { SocialKey };

export const whatsappHref = socials.find((s) => s.key === "whatsapp")!.href;

export const services = serviceDetails.map((s) => ({ title: s.title, description: s.short, slug: s.slug }));

export type LinkButton =
  | { id: string; label: string; kind: "about" }
  | { id: string; label: string; kind: "services" }
  | { id: string; label: string; kind: "contact" }
  | { id: string; label: string; kind: "link"; href: string };

export const linkButtons: LinkButton[] = [
  { id: "about", label: "About Me", kind: "about" },
  { id: "services", label: "Services", kind: "services" },
  { id: "whatsapp", label: "WhatsApp Me", kind: "link", href: whatsappHref },
  { id: "stories", label: "Client Testimonials", kind: "link", href: "/stories" },
  { id: "contact", label: "Contact / Email Me", kind: "contact" },
];
