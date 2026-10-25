import type { ReactNode } from "react";
import { cardCls } from "./styles";
import { cn } from "@/lib/utils";

export function PageTitle({ title, intro, actions }: { title: string; intro?: string; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[clamp(28px,4vw,38px)] font-medium leading-tight text-forest-900 [font-variation-settings:'SOFT'_100,'opsz'_72]">{title}</h1>
        {intro && <p className="mt-1.5 max-w-[60ch] text-[15px] leading-relaxed text-ink-soft">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section className={cn(cardCls, className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-[21px] text-forest-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const tones: Record<string, string> = {
  pending: "bg-[#fdf1d8] text-[#8a5a00]",
  approved: "bg-mint-200 text-forest-800",
  featured: "bg-leaf-300 text-forest-900",
  rejected: "bg-[#fbeee9] text-[#a23b22]",
  hidden: "bg-sand text-ink-soft",
  deleted: "bg-[#eee] text-[#666]",
  new: "bg-[#fdf1d8] text-[#8a5a00]",
  converted: "bg-mint-200 text-forest-800",
  closed: "bg-sand text-ink-soft",
  scheduled: "bg-[#e3eefb] text-[#1d4e89]",
  confirmed: "bg-mint-200 text-forest-800",
  completed: "bg-leaf-300 text-forest-900",
  cancelled: "bg-[#fbeee9] text-[#a23b22]",
  no_show: "bg-[#eee] text-[#555]",
};

export function Badge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold capitalize", tones[status] ?? "bg-sand text-ink-soft")}>
      {status.replace("_", " ")}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-leaf-400/50 bg-mint-50 px-4 py-6 text-center text-[14.5px] text-ink-soft">{children}</p>;
}
