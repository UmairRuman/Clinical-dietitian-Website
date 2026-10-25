import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ children, className, narrow }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return <div className={cn("mx-auto w-full px-5 sm:px-8", narrow ? "max-w-[720px]" : "max-w-[1200px]", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  tone = "light",
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto text-center" : "text-left", "max-w-[640px]")}>
      <p className={cn("text-[12px] font-bold uppercase tracking-[0.26em]", tone === "dark" ? "text-leaf-300" : "text-forest-700/80")}>{eyebrow}</p>
      <h2
        className={cn(
          "mt-3 font-display text-[clamp(30px,4.4vw,48px)] font-medium leading-[1.08] tracking-[-0.01em] [font-variation-settings:'SOFT'_100,'opsz'_144]",
          tone === "dark" ? "text-mint-50" : "text-forest-900",
        )}
      >
        {title}
      </h2>
      {intro && <p className={cn("mt-4 text-[17px] leading-relaxed", tone === "dark" ? "text-mint-200/90" : "text-ink-soft")}>{intro}</p>}
    </div>
  );
}

/** Heading band used at the top of inner pages */
export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: ReactNode; intro?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-leaf-400/25 bg-[radial-gradient(120%_120%_at_50%_0%,#f3faf3_0%,#e4f3e6_100%)] pb-14 pt-14 sm:pb-20 sm:pt-20">
      <Container className="relative text-center">
        <p className="rise text-[12px] font-bold uppercase tracking-[0.26em] text-forest-700/80">{eyebrow}</p>
        <h1
          className="rise mx-auto mt-3 max-w-[20ch] font-display text-[clamp(36px,6vw,64px)] font-medium leading-[1.04] tracking-[-0.015em] text-forest-900 [font-variation-settings:'SOFT'_100,'opsz'_144]"
          style={{ ["--d" as string]: "90ms" }}
        >
          {title}
        </h1>
        {intro && (
          <p className="rise mx-auto mt-5 max-w-[56ch] text-[17px] leading-relaxed text-ink-soft sm:text-[18px]" style={{ ["--d" as string]: "180ms" }}>
            {intro}
          </p>
        )}
        {children && (
          <div className="rise mt-8" style={{ ["--d" as string]: "260ms" }}>
            {children}
          </div>
        )}
      </Container>
    </section>
  );
}
