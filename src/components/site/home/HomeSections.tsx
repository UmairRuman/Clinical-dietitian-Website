import Link from "next/link";
import { Sprig, VineDivider } from "@/components/brand/Botanicals";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { SocialIcon } from "@/components/brand/SocialIcon";
import { ProfilePortrait } from "@/components/home/ProfilePortrait";
import { Reveal } from "@/components/ui/Reveal";
import { BookLink } from "@/components/site/BookLink";
import { Container, SectionHeading } from "@/components/site/primitives";
import { principles, processSteps, type ServiceDetail } from "@/lib/content";
import type { Profile, Social } from "@/server/content";

function Tagline({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return <>{text}</>;
  const i = Math.floor(words.length / 2);
  return (
    <>
      {words.slice(0, i).join(" ")} <em className="font-normal italic text-forest-700">{words[i]}</em> {words.slice(i + 1).join(" ")}
    </>
  );
}

export function Hero({ profile, socials }: { profile: Profile; socials: Social[] }) {
  return (
    <section className="relative overflow-hidden pb-16 pt-6 sm:pb-24 lg:pt-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_75%_30%,#d2ebd6_0%,transparent_70%),linear-gradient(180deg,#f3faf3,#e4f3e6)]" />
      <Sprig className="drift pointer-events-none absolute -bottom-24 -left-16 hidden h-[340px] text-forest-700/12 lg:block" />
      <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className="rise inline-flex items-center gap-2.5 rounded-full border border-forest-700/20 bg-paper/70 px-4 py-2 text-[13px] font-semibold tracking-wide text-forest-700" style={{ ["--d" as string]: "100ms" }}>
            <span className="size-2 rounded-full bg-clay" />
            {profile.experience.replace(" - ", " · ")}
          </p>
          <h1
            className="rise mt-6 font-display text-[clamp(44px,7.4vw,92px)] font-medium leading-[0.98] tracking-[-0.025em] text-forest-900 [font-variation-settings:'SOFT'_100,'opsz'_144]"
            style={{ ["--d" as string]: "200ms" }}
          >
            <Tagline text={profile.tagline} />
          </h1>
          <p className="rise mx-auto mt-6 max-w-[48ch] text-[18px] leading-[1.7] text-ink-soft lg:mx-0" style={{ ["--d" as string]: "330ms" }}>
            Hello, I&apos;m <strong className="font-semibold text-forest-900">{profile.name}</strong>. I create personalised, practical and sustainable nutrition plans, so healthy living feels simple and achievable.
          </p>
          <div className="rise mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start" style={{ ["--d" as string]: "450ms" }}>
            <BookLink size="lg" className="w-full sm:w-auto" />
            <Link
              href="/services"
              className="inline-flex min-h-16 w-full items-center justify-center gap-2 rounded-full px-8 text-[15px] font-semibold text-forest-800 underline decoration-leaf-400 decoration-2 underline-offset-[7px] hover:decoration-forest-700 sm:w-auto"
            >
              Explore services
              <span aria-hidden>→</span>
            </Link>
          </div>
          <ul className="rise mt-9 flex items-center justify-center gap-2.5 lg:justify-start" style={{ ["--d" as string]: "560ms" }} aria-label="Social links">
            {socials.map((s) => (
              <li key={s.key}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="grid size-11 place-items-center rounded-full border border-forest-700/25 bg-paper/80 text-forest-700 transition hover:-translate-y-0.5 hover:bg-leaf-300 hover:text-forest-900">
                  <SocialIcon name={s.key} className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative order-1 lg:order-2">
          <ProfilePortrait photoUrl={profile.photoUrl} alt={profile.photoAlt} className="size-[min(60vw,440px)]" sizes="440px" />
          <div className="pop absolute left-[2%] top-[14%] hidden rotate-[-4deg] rounded-2xl card-paper px-4 py-3 sm:block" style={{ ["--d" as string]: "1300ms" }}>
            <p className="font-display text-[26px] leading-none text-forest-700">6+</p>
            <p className="mt-1 text-[12px] font-semibold text-ink-soft">years in clinical dietetics</p>
          </div>
          <div className="pop absolute bottom-[10%] right-[0%] hidden rotate-[3deg] rounded-2xl card-paper px-4 py-3 sm:block" style={{ ["--d" as string]: "1450ms" }}>
            <p className="font-display text-[26px] leading-none text-forest-700">1:1</p>
            <p className="mt-1 text-[12px] font-semibold text-ink-soft">personalised plans</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function WhoIHelp({ services }: { services: ServiceDetail[] }) {
  return (
    <section className="bg-paper py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="How I can help" title={<>Nutrition care for <em className="italic text-forest-700">your</em> health goals</>} intro="Six areas of focus, each with a plan built around your body, your routine and the food you already love." />
        </Reveal>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <li key={s.slug}>
              <Reveal delay={(i % 3) * 0.08} className="h-full">
                <Link
                  href={`/services/${s.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-leaf-400/30 bg-mint-50 p-7 transition duration-500 hover:-translate-y-1.5 hover:border-leaf-500/60 hover:bg-white hover:shadow-[0_30px_50px_-30px_rgba(36,85,58,0.5)]"
                >
                  <span className="grid size-14 place-items-center rounded-2xl bg-leaf-300/60 text-forest-800 transition duration-500 group-hover:rotate-[-6deg] group-hover:bg-leaf-300">
                    <ServiceIcon name={s.icon} className="size-8" />
                  </span>
                  <h3 className="mt-6 font-display text-[26px] leading-tight text-forest-900">{s.title}</h3>
                  <p className="mt-2 flex-1 text-[16px] leading-relaxed text-ink-soft">{s.short}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-bold uppercase tracking-[0.1em] text-forest-700">
                    Learn more
                    <span aria-hidden className="transition group-hover:translate-x-1.5">→</span>
                  </span>
                  <span aria-hidden className="absolute -bottom-3 -right-3 font-display text-[96px] leading-none text-leaf-300/25">{String(i + 1).padStart(2, "0")}</span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function AboutTeaser({ profile }: { profile: Profile }) {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <div className="relative mx-auto max-w-[460px]">
            <div className="absolute -inset-4 rotate-[-3deg] rounded-[44px] bg-leaf-300/40" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] border-[6px] border-paper bg-[radial-gradient(circle_at_30%_20%,#f3faf3,#cfe9d4_75%)] shadow-[0_40px_70px_-40px_rgba(23,58,38,0.6)]">
              <Sprig className="absolute -bottom-6 -left-4 h-[70%] text-forest-700/25" />
              <Sprig className="absolute -right-4 -top-6 h-[60%] -scale-x-100 rotate-[160deg] text-leaf-500/40" />
              <div role="img" aria-label="Photo of Dn. Bushra Naseem to be added" className="absolute inset-0 grid place-items-center font-display text-[120px] font-medium text-forest-700/90">BN</div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <SectionHeading align="left" eyebrow="Meet your dietitian" title={<>Healthy living, made simple</>} />
          <p className="mt-6 max-w-[56ch] text-[17px] leading-[1.8] text-ink-soft">
            {profile.bio}
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {principles.map((p) => (
              <li key={p.title} className="rounded-2xl border border-leaf-400/30 bg-paper/70 p-4">
                <p className="font-display text-[20px] text-forest-800">{p.title}</p>
                <p className="mt-1 text-[14px] leading-snug text-ink-soft">{p.text}</p>
              </li>
            ))}
          </ul>
          <Link href="/about" className="mt-9 inline-flex items-center gap-2 text-[15px] font-bold uppercase tracking-[0.1em] text-forest-700 underline decoration-leaf-400 decoration-2 underline-offset-[8px] hover:decoration-forest-700">
            More about me <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}

export function HowItWorks({ id }: { id?: string }) {
  return (
    <section id={id} className="relative overflow-hidden bg-forest-900 py-20 text-mint-100 sm:py-28">
      <Sprig className="pointer-events-none absolute -right-10 top-10 h-[420px] rotate-[18deg] text-leaf-300/10" />
      <Container className="relative">
        <Reveal>
          <SectionHeading tone="dark" eyebrow="How it works" title="Three simple steps to your plan" intro="No pressure and no jargon. Just a clear path from your first message to a plan that works." />
        </Reveal>
        <ol className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          <div aria-hidden className="absolute left-[16%] right-[16%] top-8 hidden border-t border-dashed border-leaf-300/40 md:block" />
          {processSteps.map((s, i) => (
            <li key={s.n}>
              <Reveal delay={i * 0.12} className="relative text-center">
                <span className="relative mx-auto grid size-16 place-items-center rounded-full bg-leaf-300 font-display text-[24px] font-semibold text-forest-900">{s.n}</span>
                <h3 className="mt-6 font-display text-[28px] text-white">{s.title}</h3>
                <p className="mx-auto mt-3 max-w-[34ch] text-[16px] leading-relaxed text-mint-200/85">{s.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <div className="mt-14 flex justify-center">
          <BookLink size="lg" />
        </div>
      </Container>
    </section>
  );
}

export function StoriesIntro() {
  return (
    <Reveal>
      <VineDivider className="mx-auto h-5 w-44" />
      <div className="mt-4">
        <SectionHeading eyebrow="Success stories" title="Real people, real routines, steady progress" />
      </div>
    </Reveal>
  );
}
