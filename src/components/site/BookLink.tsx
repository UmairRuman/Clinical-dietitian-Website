"use client";

import type { ReactNode } from "react";
import { useBooking } from "@/components/booking/BookingProvider";
import { cn } from "@/lib/utils";

const styles = {
  primary:
    "cta-surface cta-sheen relative isolate overflow-hidden text-forest-900 hover:-translate-y-0.5 hover:brightness-[1.03]",
  dark: "bg-forest-900 text-mint-50 hover:bg-forest-800 hover:-translate-y-0.5",
  outline: "border border-forest-700/40 text-forest-900 hover:bg-mint-100",
} as const;

/** Opens the booking sheet (WhatsApp / enquiry). Visitors never see the admin calendar. */
export function BookLink({
  children = "Book a Session",
  variant = "primary",
  size = "md",
  view = "choose",
  className,
}: {
  children?: ReactNode;
  variant?: keyof typeof styles;
  size?: "sm" | "md" | "lg";
  view?: "choose" | "email";
  className?: string;
}) {
  const { openBooking } = useBooking();
  return (
    <button
      onClick={() => openBooking(view)}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-bold uppercase transition duration-300 active:scale-[0.98]",
        size === "sm" && "min-h-11 px-5 text-[13px] tracking-[0.1em]",
        size === "md" && "min-h-13 px-7 text-[14px] tracking-[0.12em]",
        size === "lg" && "min-h-16 px-10 text-[15px] tracking-[0.14em]",
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
