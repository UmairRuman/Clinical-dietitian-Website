"use client";

import { useCallback, useState, useTransition } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { submissionSchema, MAX_PHOTOS, MAX_PHOTO_BYTES, PHOTO_TYPES, type SubmissionInput } from "@/lib/schemas/submission";
import { submitStory } from "@/app/actions/submission";
import { cn } from "@/lib/utils";
import { Turnstile } from "@/components/ui/Turnstile";

const input =
  "w-full rounded-2xl border border-leaf-400/60 bg-white/80 px-4 py-3 text-[16px] text-forest-900 placeholder:text-ink-soft/60 transition focus:border-forest-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-leaf-300/50";

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-semibold uppercase tracking-[0.08em] text-forest-700">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-[13px] text-ink-soft">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-sm text-[#b4452a]">
          {error}
        </span>
      )}
    </div>
  );
}

function Check({ children, error, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[14.5px] leading-snug text-forest-900/90">
      <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[#2f6b45]" {...rest} />
      <span>
        {children}
        {error && (
          <span role="alert" className="mt-1 block text-sm text-[#b4452a]">
            {error}
          </span>
        )}
      </span>
    </label>
  );
}

const STAR = "m12 2.8 2.7 5.8 6.3.7-4.7 4.3 1.3 6.3L12 16.7 6.4 20l1.3-6.3L3 9.3l6.3-.7L12 2.8Z";

export function SubmitForm() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState("");
  const onToken = useCallback((t: string) => setToken(t), []);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { type: "story", namePref: "first", photoConsent: false },
  });
  const type = useWatch({ control, name: "type" });
  const body = useWatch({ control, name: "body" }) ?? "";

  const onPick = (files: FileList | null) => {
    setPhotoError(null);
    const next = [...photos, ...Array.from(files ?? [])];
    if (next.length > MAX_PHOTOS) return setPhotoError(`You can add up to ${MAX_PHOTOS} photos.`);
    if (next.some((f) => !PHOTO_TYPES.includes(f.type))) return setPhotoError("Only JPG, PNG or WebP images.");
    if (next.some((f) => f.size > MAX_PHOTO_BYTES)) return setPhotoError("Each photo must be 5 MB or smaller.");
    setPhotos(next);
  };

  const onSubmit = handleSubmit((v) => {
    setServerError(null);
    const fd = new FormData();
    Object.entries(v).forEach(([k, val]) => val !== undefined && fd.append(k, String(val)));
    photos.forEach((f) => fd.append("photos", f));
    fd.append("turnstileToken", token);
    startTransition(async () => {
      const res = await submitStory(fd);
      if (res.ok) setSent(true);
      else setServerError(res.error);
    });
  });

  if (sent) {
    return (
      <div className="card-paper rounded-[28px] p-8 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-leaf-300 text-forest-900">
          <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h2 className="mt-5 font-display text-[28px]">Thank you</h2>
        <p className="mx-auto mt-2 max-w-[32ch] text-ink-soft">Your submission will appear on the website after review.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-forest-700 px-8 py-3 font-semibold text-white hover:bg-forest-800">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card-paper relative space-y-5 rounded-[28px] p-6">
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <div role="radiogroup" aria-label="Submission type" className="flex rounded-full bg-mint-200/70 p-1.5">
            {(
              [
                ["story", "Success story"],
                ["review", "Review"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={field.value === k}
                onClick={() => field.onChange(k)}
                className={cn(
                  "min-h-11 flex-1 rounded-full text-[15px] font-semibold transition",
                  field.value === k ? "bg-paper text-forest-900 shadow-[0_6px_14px_-8px_rgba(36,85,58,0.7)]" : "text-forest-700",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        )}
      />

      <Field label="Your name" error={errors.name?.message}>
        <input {...register("name")} autoComplete="name" className={input} />
      </Field>
      <Field label="Show my name as">
        <select {...register("namePref")} className={cn(input, "appearance-none")}>
          <option value="full">Full name</option>
          <option value="first">First name only</option>
          <option value="anonymous">Anonymous</option>
        </select>
      </Field>
      <Field label="Phone or email (private)" hint="Never shown publicly. Only used to verify you are a client." error={errors.contact?.message}>
        <input {...register("contact")} autoComplete="email" className={input} />
      </Field>

      {type === "review" && (
        <Field label="Rating" error={errors.rating?.message}>
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <div role="radiogroup" aria-label="Star rating" className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => {
                  const on = Number(field.value) >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={Number(field.value) === n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      onClick={() => field.onChange(n)}
                      className="grid size-11 place-items-center"
                    >
                      <svg viewBox="0 0 24 24" className={cn("size-8 transition", on ? "text-clay" : "text-leaf-400/60")} aria-hidden>
                        <path d={STAR} fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </Field>
      )}

      <Field label={type === "review" ? "Your review" : "Your story"} error={errors.body?.message}>
        <textarea {...register("body")} dir="auto" rows={5} className={cn(input, "resize-none")} placeholder="English ya Roman Urdu, jo aap ko behtar lage" />
        <span className="mt-1 block text-right text-xs text-ink-soft">{body.length}/1000</span>
      </Field>

      {type === "story" && (
        <Field label="Result (optional)" hint="For example: Lost 4 kg in 3 weeks">
          <input {...register("result")} className={input} />
        </Field>
      )}

      <Field label={`Photos (optional, up to ${MAX_PHOTOS})`} hint="JPG, PNG or WebP, up to 5 MB each." error={photoError ?? undefined}>
        <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-leaf-400 bg-mint-50 px-4 text-[15px] font-semibold text-forest-700 hover:bg-mint-100">
          Add photos
          <input
            type="file"
            accept={PHOTO_TYPES.join(",")}
            multiple
            className="sr-only"
            onChange={(e) => {
              onPick(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {photos.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {photos.map((f, i) => (
              <li key={i} className="flex items-center gap-2 rounded-full bg-mint-100 py-1 pl-3 pr-1 text-sm">
                <span className="max-w-[140px] truncate">{f.name}</span>
                <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="grid size-7 place-items-center rounded-full hover:bg-leaf-300">
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </Field>

      <div className="space-y-3">
        <Check {...register("consent")} error={errors.consent?.message}>
          I agree that my review and photos may be published on this website.
        </Check>
        {photos.length > 0 && (
          <Check {...register("photoConsent")}>I confirm I have the right to share these photos and agree to their publication.</Check>
        )}
      </div>

      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <Turnstile onToken={onToken} />
      {serverError && (
        <p role="alert" className="text-sm text-[#b4452a]">
          {serverError}
        </p>
      )}
      <button type="submit" disabled={pending} className="cta-surface relative w-full rounded-full py-4 text-[17px] font-bold uppercase tracking-[0.1em] text-forest-900 transition active:scale-[0.98] disabled:opacity-70">
        {pending ? "Submitting…" : "Submit"}
      </button>
      <p className="text-center text-[13px] text-ink-soft">Submissions are reviewed before they appear on the website.</p>
    </form>
  );
}
