"use client";

import { useBooking } from "@/components/booking/BookingProvider";
import { PillButton } from "@/components/ui/PillButton";

export function BookButton() {
  const { openBooking } = useBooking();
  return (
    <PillButton variant="primary" onClick={() => openBooking("choose")}>
      Book a Session
    </PillButton>
  );
}
