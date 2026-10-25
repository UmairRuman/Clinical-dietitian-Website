import Link from "next/link";
import { AboutTeaser, Hero, HowItWorks, StoriesIntro, WhoIHelp } from "@/components/site/home/HomeSections";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList } from "@/components/site/FaqList";
import { Container, SectionHeading } from "@/components/site/primitives";
import { StoriesCarousel } from "@/components/home/StoriesCarousel";
import { Reveal } from "@/components/ui/Reveal";
import { siteUrl } from "@/lib/site";
import { getFaqs, getFeaturedStories, getProfile, getServices, getSocials } from "@/server/content";

export default async function HomePage() {
  const [profile, socials, services, faqs, stories] = await Promise.all([getProfile(), getSocials(), getServices(), getFaqs(), getFeaturedStories()]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: profile.name, url: siteUrl },
      {
        "@type": "Person",
        name: profile.name,
        jobTitle: "Clinical Dietitian",
        description: profile.bio,
        url: siteUrl,
        telephone: profile.phone,
        email: profile.email,
        image: profile.photoUrl ?? undefined,
        sameAs: socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
        knowsAbout: services.map((s) => s.title),
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero profile={profile} socials={socials} />
      <WhoIHelp services={services} />
      <AboutTeaser profile={profile} />
      <HowItWorks />

      <section className="py-20 sm:py-28" aria-label="Client success stories">
        <Container>
          <StoriesIntro />
          {stories.length > 0 ? (
            <Reveal delay={0.1} className="mt-12">
              <StoriesCarousel stories={stories} wide />
            </Reveal>
          ) : (
            <p className="mx-auto mt-10 max-w-[48ch] text-center text-[17px] leading-relaxed text-ink-soft">
              Client stories will appear here soon. Have you worked with Dn. Bushra? We would love to hear from you.
            </p>
          )}
          <Reveal className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/stories/submit" className="cta-surface inline-flex min-h-14 items-center rounded-full px-8 text-[14px] font-bold uppercase tracking-[0.1em] text-forest-900">
              Share your story / review
            </Link>
            {stories.length > 0 && (
              <Link href="/stories" className="py-2 text-[15px] font-semibold text-forest-700 underline decoration-leaf-400 decoration-2 underline-offset-[6px] hover:decoration-forest-700">
                View all stories
              </Link>
            )}
          </Reveal>
          <p className="mx-auto mt-6 max-w-[56ch] text-center text-[13px] text-ink-soft">Results vary from person to person and are not a guarantee.</p>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <SectionHeading align="left" eyebrow="Good to know" title="Questions, answered" intro="Everything you might wonder before your first session. Still unsure? Just message on WhatsApp." />
          </Reveal>
          <Reveal delay={0.1}>
            <FaqList items={faqs} />
          </Reveal>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
