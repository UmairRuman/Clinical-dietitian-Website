import type { Metadata } from "next";
import { CtaBand } from "@/components/site/CtaBand";
import { Container, PageHero, SectionHeading } from "@/components/site/primitives";
import { HowItWorks } from "@/components/site/home/HomeSections";
import { ProfilePortrait } from "@/components/home/ProfilePortrait";
import { Reveal } from "@/components/ui/Reveal";
import { principles } from "@/lib/content";
import { getProfile } from "@/server/content";

export const metadata: Metadata = {
  title: "About",
  description: "Meet Dn. Bushra Naseem, a clinical dietitian with 6 years of experience helping people reach their wellness goals.",
};

export default async function AboutPage() {
  const profile = await getProfile();
  const paragraphs = profile.aboutLong?.split(/\n{2,}/).filter(Boolean) ?? null;
  return (
    <>
      <PageHero eyebrow="About" title={<>Hello, I&apos;m {profile.name}</>} intro={profile.experience.replace(" - ", " · ")} />
      <section className="py-20 sm:py-24">
        <Container className="grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <ProfilePortrait photoUrl={profile.photoUrl} alt={profile.photoAlt} className="size-[min(78vw,400px)]" sizes="400px" />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 text-[18px] leading-[1.85] text-forest-900/85">
              {paragraphs ? (
                paragraphs.map((p, i) => <p key={i}>{p}</p>)
              ) : (
                <>
                  <p>{profile.bio}</p>
                  <p>
                    I work with clients on weight management, diabetic diet plans, uric acid, hypo and hypertension, sports nutrition and PCOS.
                  </p>
                  <p>
                    Every plan starts with listening: your health history, your routine and the food your family cooks. From there we build something you can actually follow, with regular check-ins so it keeps working as your life changes.
                  </p>
                </>
              )}
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="My approach" title="Three principles behind every plan" />
          </Reveal>
          <ul className="mt-14 grid gap-5 md:grid-cols-3">
            {principles.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={i * 0.1} className="h-full">
                  <div className="h-full rounded-[28px] border border-leaf-400/30 bg-mint-50 p-8">
                    <p className="font-display text-[44px] leading-none text-leaf-500">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-5 font-display text-[28px] text-forest-900">{p.title}</h3>
                    <p className="mt-3 text-[16.5px] leading-relaxed text-ink-soft">{p.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <HowItWorks />
      <CtaBand />
    </>
  );
}
