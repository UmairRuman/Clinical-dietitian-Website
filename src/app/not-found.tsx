import Link from "next/link";
import { Backdrop } from "@/components/brand/Backdrop";
import { Sprig } from "@/components/brand/Botanicals";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <Backdrop />
      <main className="grid min-h-dvh place-items-center px-6 py-16 text-center">
        <div>
          <Sprig className="mx-auto h-28 text-forest-700/60" />
          <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.26em] text-forest-700/80">Error 404</p>
          <h1 className="mt-3 font-display text-[clamp(36px,7vw,64px)] font-medium leading-[1.05] text-forest-900 [font-variation-settings:'SOFT'_100,'opsz'_144]">
            This page has wandered off
          </h1>
          <p className="mx-auto mt-4 max-w-[42ch] text-[17px] leading-relaxed text-ink-soft">The link may be old or mistyped. Let&apos;s get you back to something nourishing.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className="cta-surface inline-flex min-h-14 items-center rounded-full px-8 text-[14px] font-bold uppercase tracking-[0.12em] text-forest-900">Back to home</Link>
            <Link href="/services" className="py-2 font-semibold text-forest-700 underline decoration-leaf-400 decoration-2 underline-offset-[6px]">See services</Link>
          </div>
        </div>
      </main>
    </>
  );
}
