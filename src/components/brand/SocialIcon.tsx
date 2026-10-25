import type { SocialKey } from "@/lib/seed";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function SocialIcon({ name, className }: { name: SocialKey; className?: string }) {
  const common = { viewBox: "0 0 24 24", className, "aria-hidden": true } as const;
  switch (name) {
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" {...stroke} />
          <circle cx="12" cy="12" r="4" {...stroke} />
          <circle cx="17.1" cy="6.9" r="1.1" fill="currentColor" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M13.5 21v-8.2h2.8l.5-3.3h-3.3V7.4c0-.9.3-1.6 1.7-1.6h1.7V2.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.5H7.5v3.3h2.8V21h3.2Z"
          />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M16.6 3c.3 2.4 1.7 3.9 4 4v3a7 7 0 0 1-4-1.3v6.3a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v3.2a2.7 2.7 0 1 0 1.9 2.5V3h3Z"
          />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common}>
          <path d="M12 3.2a8.8 8.8 0 0 0-7.5 13.4L3.2 20.8l4.3-1.2A8.8 8.8 0 1 0 12 3.2Z" {...stroke} />
          <path
            fill="currentColor"
            d="M9.2 7.9c.2-.4.5-.4.8-.4h.4l.9 2-.7.9a5.4 5.4 0 0 0 2.5 2.5l.9-.7 2 .9v.4c0 .4-.1.8-.6 1.1-.7.4-1.6.4-2.8-.1a7.4 7.4 0 0 1-3.6-3.5c-.5-1.1-.3-2 .2-3.1Z"
          />
        </svg>
      );
    case "email":
      return (
        <svg {...common}>
          <rect x="3.2" y="5.2" width="17.6" height="13.6" rx="3" {...stroke} />
          <path d="m4.5 7.5 7.5 5.6 7.5-5.6" {...stroke} />
        </svg>
      );
  }
}
