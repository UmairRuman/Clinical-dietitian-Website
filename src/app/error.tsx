"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-6 py-16 text-center">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.26em] text-forest-700/80">Something went wrong</p>
        <h1 className="mt-3 font-display text-[clamp(32px,6vw,52px)] leading-[1.05] text-forest-900">We hit a small snag</h1>
        <p className="mx-auto mt-4 max-w-[40ch] text-[17px] leading-relaxed text-ink-soft">Please try again. If it keeps happening, message us on WhatsApp and we will help.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button onClick={reset} className="cta-surface inline-flex min-h-14 items-center rounded-full px-8 text-[14px] font-bold uppercase tracking-[0.12em] text-forest-900">Try again</button>
          <Link href="/" className="py-2 font-semibold text-forest-700 underline decoration-leaf-400 decoration-2 underline-offset-[6px]">Back to home</Link>
        </div>
      </div>
    </main>
  );
}
