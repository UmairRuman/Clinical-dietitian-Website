"use server";

import { bookingRequestSchema } from "@/lib/schemas/booking";
import { cleanText } from "@/lib/text";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailLayout, sendEmail } from "@/server/email";
import { clientIp, rateLimit } from "@/server/rate-limit";
import { verifyTurnstile } from "@/server/turnstile";

export type BookingResult = { ok: true } | { ok: false; error: string };

/** Visitor enquiry ("Book by email"): saved in Booking Requests and emailed to the admin. */
export async function submitBookingRequest(input: unknown): Promise<BookingResult> {
  const parsed = bookingRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields." };
  const v = parsed.data;
  if (v.website) return { ok: true }; // honeypot: pretend success, store nothing

  const ip = await clientIp();
  if (!(await rateLimit(`enquiry:${ip}`, 5, 3600))) return { ok: false, error: "Too many requests from your connection. Please try again later or use WhatsApp." };
  if (!(await verifyTurnstile(v.turnstileToken, ip))) return { ok: false, error: "We could not verify you are human. Please refresh and try again." };

  const db = createAdminClient();
  const row = {
    name: cleanText(v.name),
    phone: cleanText(v.phone),
    email: v.email ? cleanText(v.email) : null,
    preferred_date: v.preferredDate,
    preferred_time: v.preferredTime,
    concern: v.concern ? cleanText(v.concern) : null,
    message: v.message ? cleanText(v.message, { multiline: true }) : null,
  };
  const { error } = await db.from("booking_requests").insert(row);
  if (error) {
    console.error("[booking] insert failed", error.message);
    return { ok: false, error: "Something went wrong saving your request. Please try WhatsApp instead." };
  }

  const { data: settings } = await db.from("settings").select("notification_email").eq("id", 1).maybeSingle();
  const to = settings?.notification_email || "naseembushra383@gmail.com";
  await sendEmail({
    to,
    subject: `New booking request from ${row.name}`,
    replyTo: row.email ?? undefined,
    html: emailLayout("New booking request", [
      ["Name", row.name],
      ["Phone / WhatsApp", row.phone],
      ["Email", row.email ?? "-"],
      ["Preferred", `${row.preferred_date} at ${row.preferred_time} (PKT)`],
      ["Concern", row.concern ?? "-"],
      ["Message", row.message ?? "-"],
    ], "Open the admin portal > Booking requests to convert this into an appointment."),
  });
  if (row.email) {
    await sendEmail({
      to: row.email,
      subject: "We received your request",
      html: emailLayout("Thank you, we received your request", [
        ["Preferred time", `${row.preferred_date} at ${row.preferred_time} (PKT)`],
        ["Concern", row.concern ?? "-"],
      ], "Dn. Bushra will contact you shortly to confirm your appointment."),
    });
  }
  return { ok: true };
}
