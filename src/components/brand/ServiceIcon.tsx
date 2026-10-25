import type { IconKey } from "@/lib/content";

const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function ServiceIcon({ name, className }: { name: IconKey; className?: string }) {
  const c = { viewBox: "0 0 24 24", className, "aria-hidden": true } as const;
  switch (name) {
    case "weight":
      return (
        <svg {...c}>
          <rect x="4.5" y="3.5" width="15" height="17" rx="4.5" {...s} />
          <path d="M8.2 10.2a5 5 0 0 1 7.6 0" {...s} />
          <path d="m12 10.4 1.6-2" {...s} />
          <path d="M9 16.5h6" {...s} />
        </svg>
      );
    case "diabetes":
      return (
        <svg {...c}>
          <path d="M12 3c3.2 4.2 5.8 7 5.8 10.3a5.8 5.8 0 0 1-11.6 0C6.2 10 8.8 7.2 12 3Z" {...s} />
          <path d="M9.6 14.2a2.6 2.6 0 0 0 2.2 2.2" {...s} />
        </svg>
      );
    case "uric":
      return (
        <svg {...c}>
          <path d="m9 3.5 4 1.8.6 4.6-4.2 2.4-3.6-2.6 1-4.4L9 3.5Z" {...s} />
          <path d="m15.8 12.2 3.4 2-.7 4-3.8 1.6-2.6-3 1.2-3.8 2.5-.8Z" {...s} />
        </svg>
      );
    case "pressure":
      return (
        <svg {...c}>
          <path d="M12 20s-7.2-4.4-7.2-10.1A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.2 2.5C19.2 15.600 12 20 12 20Z" {...s} />
          <path d="M7.2 12.4h2.2l1.4-2.6 2.2 4.4 1.2-1.8h2.6" {...s} />
        </svg>
      );
    case "sports":
      return (
        <svg {...c}>
          <path d="M6.5 7.5v9M3.8 9.5v5M17.5 7.5v9M20.2 9.5v5M6.5 12h11" {...s} />
        </svg>
      );
    case "pcos":
      return (
        <svg {...c}>
          <circle cx="12" cy="12" r="2" {...s} />
          {[0, 60, 120, 180, 240, 300].map((r) => (
            <ellipse key={r} cx="12" cy="6.6" rx="2.1" ry="3.1" transform={`rotate(${r} 12 12)`} {...s} />
          ))}
        </svg>
      );
  }
}
