import { z } from "zod";

export const bookingRequestSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a phone or WhatsApp number")
    .max(20)
    .regex(/^[+\d][\d\s-]{6,19}$/, "Use digits only, for example +92 300 1234567"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email or leave it blank").max(120)]).optional(),
  preferredDate: z.string().min(1, "Choose a preferred date"),
  preferredTime: z.string().min(1, "Choose a preferred time"),
  concern: z.string().max(80).optional(),
  message: z.string().trim().max(800).optional(),
  // honeypot: real people never fill this in
  website: z.string().max(0).optional(),
  turnstileToken: z.string().optional(),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
