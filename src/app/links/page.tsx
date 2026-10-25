import Link from "next/link";
import type { Metadata } from "next";
import { Backdrop } from "@/components/brand/Backdrop";
import { VineDivider } from "@/components/brand/Botanicals";
import { SocialIcon } from "@/components/brand/SocialIcon";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { BookButton } from "@/components/home/BookButton";
import { FloatingWhatsApp } from "@/components/home/FloatingWhatsApp";
import { Footer } from "@/components/home/Footer";
import { LinkButtons } from "@/components/home/LinkButtons";
import { ProfilePortrait } from "@/components/home/ProfilePortrait";
import { StoriesCarousel } from "@/components/home/StoriesCarousel";
import { PillLink } from "@/components/ui/PillButton";
import { Reveal } from "@/components/ui/Reveal";
import { getFeaturedStories, getLinkButtons, getProfile, getServices, getSocials, getWhatsappHref } from "@/server/content";

export const metadata: Metadata = {
  title: "Links",
  description: "Book a session with Dn. Bushra Naseem, Clinical Dietitian. Achieve your wellness goals.",
};

export default async function LinksPage() {
  const [profile, socials, buttons, services, stories, whatsappHref] = await Promise.all([
    getProfile(),
    getSocials(),
    getLinkButtons(),
    getServices(),
    getFeaturedStories(),
    getWhatsappHref(),
  ]);

  return (
    <BookingProvider whatsappHref={whatsappHref} concerns={services.map((s) => s.title)}>
      <Backdrop />
      <main className="mx-auto w-full max-w-[520px] px-5 pt-10 sm:pt-14 lg:my-8 lg:rounded-[48px] lg:border lg:border-white/70 lg:bg-paper/50 lg:px-10 lg:pt-14 lg:shadow-[0_40px_90px_-40px_rgba(23,58,38,0.45)] lg:backdrop-blur-[6px]">
        <header className="text-center">
          <ProfilePortrait photoUrl={profile.photoUrl} alt={profile.photoAlt} />

          <h1
            className="rise mt-7 font-display text-[clamp(34px,10.5vw,46px)] font-semibold leading-[1.05] tracking-[-0.015em] text-forest-900 [font-variation-settings:'SOFT'_100,'opsz'_144]"
            style={{ ["--d" as string]: "650ms" }}
          >
            {profile.name}
          </h1>
          <p className="rise mt-3 text-[17px] text-forest-900/85" style={{ ["--d" as string]: "760ms" }}>
            {profile.experience}
          </p>
          <p
            className="rise mt-1.5 font-display text-[21px] italic text-forest-700 [font-variation-settings:'SOFT'_100,'opsz'_36]"
            style={{ ["--d" as string]: "860ms" }}
          >
            {profile.tagline}
          </p>

          <ul className="mt-7 flex justify-center gap-3 sm:gap-4" aria-label="Social links">
            {socials.map((s, i) => (
              <li key={s.key} className="pop" style={{ ["--d" as string]: `${900 + i * 70}ms` }}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="group relative grid size-[52px] place-items-center rounded-full border border-forest-700/25 bg-paper text-forest-700 shadow-[0_8px_18px_-10px_rgba(36,85,58,0.6)] transition duration-300 hover:-translate-y-1 hover:border-transparent hover:bg-leaf-300 hover:text-forest-900"
                >
                  <SocialIcon name={s.key} className="size-[23px]" />
                  <span className="pointer-events-none absolute -bottom-8 hidden whitespace-nowrap rounded-full bg-forest-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 lg:block">
                    {s.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </header>

        <div className="rise mt-9" style={{ ["--d" as string]: "1000ms" }}>
          <BookButton />
        </div>

        <nav aria-label="Links" className="mt-5">
          <LinkButtons buttons={buttons} about={profile.bio} services={services.map((s) => ({ title: s.title, description: s.short }))} />
        </nav>

        <section aria-labelledby="stories-h" className="mt-16">
          <Reveal>
            <VineDivider className="mx-auto h-5 w-44" />
            <h2
              id="stories-h"
              className="mt-4 text-center font-display text-[32px] leading-tight text-forest-900 [font-variation-settings:'SOFT'_100,'opsz'_96]"
            >
              Client Success Stories
            </h2>
            <p className="mx-auto mt-2 max-w-[32ch] text-center text-[15px] text-ink-soft">Real people, real routines, steady progress.</p>
          </Reveal>
          {stories.length > 0 && (
            <Reveal delay={0.1} className="mt-7">
              <StoriesCarousel stories={stories} />
            </Reveal>
          )}
          <Reveal delay={0.1} className="mt-5 flex flex-col items-center gap-3">
            <PillLink variant="primary" href="/stories/submit" className="!min-h-14 !w-auto !text-[15px] !tracking-[0.08em]">
              Share your story / review
            </PillLink>
            {stories.length > 0 && (
              <Link href="/stories" className="py-2 text-[15px] font-semibold text-forest-700 underline decoration-leaf-400 decoration-2 underline-offset-[6px] hover:decoration-forest-700">
                View all
              </Link>
            )}
            <p className="mt-2 max-w-[38ch] text-center text-[13px] leading-relaxed text-ink-soft">
              Results vary from person to person and are not a guarantee.
            </p>
          </Reveal>
        </section>

        <Footer profile={profile} />
      </main>
      <FloatingWhatsApp href={whatsappHref} />
    </BookingProvider>
  );
}
