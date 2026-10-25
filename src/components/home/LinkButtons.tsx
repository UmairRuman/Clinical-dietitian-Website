"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useBooking } from "@/components/booking/BookingProvider";
import type { LinkButton } from "@/lib/seed";
import { cn } from "@/lib/utils";

const row =
  "card-paper group flex min-h-16 w-full items-center justify-between gap-3 rounded-full px-7 text-[17px] font-semibold text-forest-900 transition duration-300 hover:-translate-y-0.5 hover:border-leaf-500/70 hover:bg-white active:scale-[0.98]";

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-5 shrink-0 text-forest-700 transition-transform duration-300", open && "rotate-180")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Out() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px] shrink-0 text-forest-700 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function LinkButtons({
  buttons,
  about,
  services,
}: {
  buttons: LinkButton[];
  about: string;
  services: { title: string; description?: string }[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { openBooking } = useBooking();
  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <ul className="space-y-3.5">
      {buttons.map((b, i) => (
        <li key={b.id} className="rise" style={{ ["--d" as string]: `${1050 + i * 70}ms` }}>
          {b.kind === "about" || b.kind === "services" ? (
            <div>
              <button
                className={row}
                aria-expanded={openId === b.id}
                aria-controls={`panel-${b.id}`}
                onClick={() => toggle(b.id)}
              >
                <span className="flex-1 text-center pl-5">{b.label}</span>
                <Chevron open={openId === b.id} />
              </button>
              <AnimatePresence initial={false}>
                {openId === b.id && (
                  <motion.div
                    id={`panel-${b.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mx-2 mt-2 rounded-3xl bg-mint-100/80 p-5">
                      {b.kind === "about" ? (
                        <p className="text-[16px] leading-[1.75] text-forest-900/90">{about}</p>
                      ) : (
                        <ul className="space-y-3">
                          {services.map((s) => (
                            <li key={s.title} className="flex gap-3">
                              <span aria-hidden className="mt-2 size-2 shrink-0 rotate-45 rounded-[3px] bg-leaf-500" />
                              <span>
                                <span className="block font-semibold">{s.title}</span>
                                {s.description && <span className="block text-[14.5px] leading-snug text-ink-soft">{s.description}</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : b.kind === "contact" ? (
            <button className={row} onClick={() => openBooking("email")}>
              <span className="flex-1 text-center pl-5">{b.label}</span>
              <Out />
            </button>
          ) : b.href.startsWith("/") ? (
            <Link href={b.href} className={row}>
              <span className="flex-1 text-center pl-5">{b.label}</span>
              <Out />
            </Link>
          ) : (
            <a href={b.href} target="_blank" rel="noopener noreferrer" className={row}>
              <span className="flex-1 text-center pl-5">{b.label}</span>
              <Out />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
