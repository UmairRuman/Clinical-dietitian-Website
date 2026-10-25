"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Sprig } from "@/components/brand/Botanicals";
import { BookLink } from "./BookLink";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/stories", label: "Success Stories" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition duration-300",
        scrolled || open ? "border-b border-leaf-400/30 bg-mint-50/85 backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5" aria-label="Dn. Bushra Naseem – home">
          <span className="grid size-10 place-items-center rounded-full bg-leaf-300/70 text-forest-700">
            <Sprig className="h-7 w-auto rotate-[8deg]" leaves={6} />
          </span>
          <span className="font-display text-[19px] font-semibold leading-none tracking-[-0.01em] text-forest-900 [font-variation-settings:'SOFT'_100,'opsz'_36]">
            Dn. Bushra Naseem
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[15px] font-semibold transition",
                  active ? "text-forest-900" : "text-forest-700 hover:text-forest-900",
                )}
              >
                {n.label}
                {active && <span className="absolute inset-x-4 -bottom-0.5 h-[2px] rounded bg-leaf-500" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <BookLink size="sm" className="hidden sm:inline-flex" />
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-11 place-items-center rounded-full text-forest-900 hover:bg-mint-100 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <ul className="mx-auto max-w-[1200px] space-y-1 px-5 pb-6 pt-2 sm:px-8">
              {[{ href: "/", label: "Home" }, ...nav].map((n) => (
                <li key={n.href}>
                  <Link href={n.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-leaf-400/25 font-display text-[24px] text-forest-900">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li className="pt-4">
                <BookLink size="lg" className="w-full" />
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
