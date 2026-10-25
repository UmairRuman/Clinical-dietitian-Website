"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { SocialIcon } from "@/components/brand/SocialIcon";
import { EnquiryForm } from "./EnquiryForm";

type View = "choose" | "email";
type Ctx = { openBooking: (view?: View) => void };

const BookingContext = createContext<Ctx | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}

export function BookingProvider({
  whatsappHref,
  concerns,
  children,
}: {
  whatsappHref: string;
  concerns: string[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("choose");

  const openBooking = useCallback((v: View = "choose") => {
    setView(v);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ openBooking }), [openBooking]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      <Sheet open={open} onClose={close} title="Book a session">
        {view === "choose" ? (
          <div>
            <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-forest-700/80">Book a session</p>
            <h2 className="mt-2 font-display text-[28px] leading-tight text-forest-900 [font-variation-settings:'SOFT'_100,'opsz'_72]">
              How would you like to book?
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              Pick whichever is easier for you. Dn. Bushra will confirm a time that suits you.
            </p>
            <div className="mt-6 grid gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="group flex items-center gap-4 rounded-3xl border border-leaf-400/50 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-forest-700/50 hover:bg-white"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-leaf-300 text-forest-900">
                  <SocialIcon name="whatsapp" className="size-6" />
                </span>
                <span className="flex-1">
                  <span className="block text-[17px] font-semibold">Chat on WhatsApp</span>
                  <span className="block text-sm text-ink-soft">Fastest. Book right in the chat.</span>
                </span>
                <Arrow />
              </a>
              <button
                onClick={() => setView("email")}
                className="group flex items-center gap-4 rounded-3xl border border-leaf-400/50 bg-white/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-forest-700/50 hover:bg-white"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-leaf-300 text-forest-900">
                  <SocialIcon name="email" className="size-6" />
                </span>
                <span className="flex-1">
                  <span className="block text-[17px] font-semibold">Send an enquiry</span>
                  <span className="block text-sm text-ink-soft">Share your preferred date and concern.</span>
                </span>
                <Arrow />
              </button>
            </div>
          </div>
        ) : (
          <EnquiryForm concerns={concerns} onBack={() => setView("choose")} onDone={close} />
        )}
      </Sheet>
    </BookingContext.Provider>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-forest-700 transition group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}
