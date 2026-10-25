"use client";

import { useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingRequestSchema, type BookingRequestInput } from "@/lib/schemas/booking";
import { submitBookingRequest } from "@/app/actions/booking";
import { cn } from "@/lib/utils";
import { Turnstile } from "@/components/ui/Turnstile";

const input =
  "w-full rounded-2xl border border-leaf-400/60 bg-white/80 px-4 py-3 text-[16px] text-forest-900 placeholder:text-ink-soft/60 transition focus:border-forest-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-leaf-300/50";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold uppercase tracking-[0.08em] text-forest-700">{label}</span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block text-sm text-[#b4452a]">
          {error}
        </span>
      )}
    </label>
  );
}

export function EnquiryForm({
  concerns,
  onBack,
  onDone,
}: {
  concerns: string[];
  onBack?: () => void;
  onDone?: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const onToken = useCallback((t: string) => setToken(t), []);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingRequestInput>({ resolver: zodResolver(bookingRequestSchema) });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await submitBookingRequest({ ...values, turnstileToken: token });
      if (res.ok) setSent(true);
      else setServerError(res.error);
    });
  });

  if (sent) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-leaf-300 text-forest-900">
          <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h2 className="mt-5 font-display text-[28px] text-forest-900">Request received</h2>
        <p className="mx-auto mt-2 max-w-[34ch] text-[15px] leading-relaxed text-ink-soft">
          Thank you. Dn. Bushra will reach out on your number to confirm a time.
        </p>
        {onDone && (
          <button onClick={onDone} className="mt-6 rounded-full bg-forest-700 px-8 py-3 font-semibold text-white transition hover:bg-forest-800">
            Done
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {onBack && (
        <button type="button" onClick={onBack} className="-ml-1 mb-1 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 6-6 6 6 6" />
          </svg>
          Back
        </button>
      )}
      <h2 className="font-display text-[26px] leading-tight text-forest-900 [font-variation-settings:'SOFT'_100,'opsz'_72]">
        Tell us a little about you
      </h2>

      <Field label="Your name" error={errors.name?.message}>
        <input {...register("name")} autoComplete="name" className={input} placeholder="e.g. Ayesha Khan" />
      </Field>
      <Field label="Phone / WhatsApp" error={errors.phone?.message}>
        <input {...register("phone")} type="tel" inputMode="tel" autoComplete="tel" className={input} placeholder="+92 300 1234567" />
      </Field>
      <Field label="Email (optional)" error={errors.email?.message}>
        <input {...register("email")} type="email" inputMode="email" autoComplete="email" className={input} placeholder="For a confirmation email" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Preferred date" error={errors.preferredDate?.message}>
          <input {...register("preferredDate")} type="date" className={input} />
        </Field>
        <Field label="Preferred time" error={errors.preferredTime?.message}>
          <input {...register("preferredTime")} type="time" className={input} />
        </Field>
      </div>
      <Field label="Health concern">
        <select {...register("concern")} className={cn(input, "appearance-none")} defaultValue="">
          <option value="">Select (optional)</option>
          {concerns.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>
      </Field>
      <Field label="Message" error={errors.message?.message}>
        <textarea {...register("message")} dir="auto" rows={3} className={cn(input, "resize-none")} placeholder="Anything you would like us to know" />
      </Field>

      {/* honeypot – hidden from people and assistive tech */}
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
      <button
        type="submit"
        disabled={pending}
        className="cta-surface relative w-full rounded-full py-4 text-[17px] font-bold uppercase tracking-[0.1em] text-forest-900 transition active:scale-[0.98] disabled:opacity-70"
      >
        {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
