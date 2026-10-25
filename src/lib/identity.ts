// Dependency-free so scripts can import it directly (see scripts/gen-seed.mjs).

export type SocialKey = "instagram" | "facebook" | "tiktok" | "whatsapp" | "email";

export const profile = {
  name: "Dn. Bushra Naseem",
  experience: "Clinical Dietitian - 6 Years of Experience",
  tagline: "Achieve Your Wellness Goals",
  bio: "I help clients achieve their wellness goals through personalized, practical, and sustainable nutrition plans - making healthy living simple and achievable.",
  photoUrl: null as string | null,
  photoAlt: "Portrait of Dn. Bushra Naseem, Clinical Dietitian",
  email: "naseembushra383@gmail.com",
  phone: "+92 320 8728620",
  phoneHref: "tel:+923208728620",
  address: null as string | null,
};

// URLs are exactly as supplied by the client (spec §6)
export const socials: { key: SocialKey; label: string; href: string }[] = [
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/dn.bushra?stkn=d2FjdnBwbnZvN3Ni" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/share/1EJUQhMRuR/" },
  { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@bushranaseem383?_r=1&_t=ZS-9A52n9lIouz" },
  { key: "whatsapp", label: "WhatsApp", href: "https://wa.me/message/SAOMQFECCL7ZC1" },
  { key: "email", label: "Email", href: "mailto:naseembushra383@gmail.com" },
];

