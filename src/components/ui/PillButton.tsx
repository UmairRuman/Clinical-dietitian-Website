import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "quiet";

const base =
  "relative isolate inline-flex min-h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full px-7 text-center font-sans text-[17px] font-semibold tracking-[0.01em] transition duration-300 will-change-transform active:scale-[0.98] motion-reduce:transition-none";

const variants: Record<Variant, string> = {
  primary:
    "cta-surface cta-sheen cta-pulse min-h-[68px] text-[19px] font-bold uppercase tracking-[0.12em] text-forest-900 hover:-translate-y-0.5 hover:brightness-[1.03]",
  secondary:
    "card-paper !rounded-full text-forest-900 hover:-translate-y-0.5 hover:border-leaf-500/70 hover:bg-white",
  quiet: "text-forest-700 hover:bg-mint-100",
};

type Common = { variant?: Variant; className?: string; children: ReactNode; icon?: ReactNode };

export function PillButton({
  variant = "secondary",
  className,
  children,
  icon,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function PillLink({
  variant = "secondary",
  className,
  children,
  icon,
  href,
  external,
}: Common & { href: string; external?: boolean }) {
  const cls = cn(base, variants[variant], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {icon}
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {icon}
      {children}
    </Link>
  );
}
