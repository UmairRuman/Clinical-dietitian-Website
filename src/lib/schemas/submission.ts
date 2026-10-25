import { z } from "zod";

export const MAX_PHOTOS = 3;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const submissionSchema = z
  .object({
    type: z.enum(["review", "story"]),
    name: z.string().trim().min(2, "Please enter your name").max(60),
    namePref: z.enum(["full", "first", "anonymous"]),
    contact: z.string().trim().min(5, "Enter a phone or email so we can verify you (never shown publicly)").max(120),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    body: z.string().trim().min(30, "Please write at least 30 characters").max(1000, "Please keep it under 1000 characters"),
    result: z.string().trim().max(80).optional(),
    consent: z.literal(true, { error: "Consent is required to publish your submission" }),
    photoConsent: z.boolean().optional(),
    website: z.string().max(0).optional(),
  })
  .refine((v) => v.type !== "review" || v.rating, { path: ["rating"], message: "Please choose a star rating" });

export type SubmissionInput = z.input<typeof submissionSchema>;
