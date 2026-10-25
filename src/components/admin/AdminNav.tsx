"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; badge?: number; group: "main" | "site" };

export function AdminNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));

  const link = (n: NavItem, mobile?: boolean) => (
    <Link
      key={n.href}
      href={n.href}
      aria-current={isActive(n.href) ? "page" : undefined}
      className={cn(
        "relative flex shrink-0 items-center justify-between gap-3 rounded-xl text-[14.5px] font-semibold transition",
        mobile ? "px-3.5 py-2" : "px-3.5 py-2.5",
        isActive(n.href) ? "bg-leaf-300 text-forest-900" : "text-mint-100/85 hover:bg-white/10 hover:text-white",
      )}
    >
      {n.label}
      {!!n.badge && (
        <span className="grid min-w-5 place-items-center rounded-full bg-clay px-1.5 text-[11px] font-bold leading-5 text-white">{n.badge}</span>
      )}
    </Link>
  );

  return (
    <>
      {/* desktop sidebar list */}
      <nav aria-label="Admin" className="hidden flex-1 flex-col gap-1 overflow-y-auto px-3 lg:flex">
        <p className="px-3.5 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-leaf-300/80">Work</p>
        {items.filter((i) => i.group === "main").map((n) => link(n))}
        <p className="px-3.5 pb-1 pt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-leaf-300/80">Website</p>
        {items.filter((i) => i.group === "site").map((n) => link(n))}
      </nav>
      {/* mobile scroller */}
      <nav aria-label="Admin" className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pb-3 lg:hidden">
        {items.map((n) => link(n, true))}
      </nav>
    </>
  );
}
