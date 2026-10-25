import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { SocialIcon } from "@/components/brand/SocialIcon";
import { BookLink } from "@/components/site/BookLink";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList } from "@/components/site/FaqList";
import { Container, SectionHeading } from "@/components/site/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { getServices, getWhatsappHref } from "@/server/content";

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = (await getServices()).find((x) => x.slug === slug);
  return s ? { title: s.title, description: s.short } : {};
}

function Block({ title, items, tone }: { title: string; items: string[]; tone?: "check" | "dot" }) {
  return (
    <div>
      <h2 className="font-display text-[30px] text-forest-900">{title}</h2>
      <ul className="mt-5 space-y-3.5">
        {items.map((t) => (
          <li key={t} className="flex gap-3.5 text-[17px] leading-relaxed text-forest-900/85">
            {tone === "check" ? (
              <svg viewBox="0 0 24 24" className="mt-1 size-5 shrink-0 text-leaf-500" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            ) : (
              <span aria-hidden className="mt-2.5 size-2 shrink-0 rotate-45 rounded-[3px] bg-leaf-500" />
            )}
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const serviceDetails = await getServices();
  const whatsappHref = await getWhatsappHref();
  const s = serviceDetails.find((x) => x.slug === slug);
  if (!s) notFound();
  const others = serviceDetails.filter((o) => o.slug !== s.slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden border-b border-leaf-400/25 bg-[radial-gradient(120%_120%_at_50%_0%,#f3faf3_0%,#e4f3e6_100%)] pb-14 pt-10 sm:pb-20 sm:pt-14">
        <Container>
          <nav aria-label="Breadcrumb" className="text-[14px] text-ink-soft">
            <Link href="/services" className="hover:text-forest-700">Services</Link>
            <span aria-hidden className="mx-2">/</span>
            <span className="text-forest-900">{s.title}</span>
          </nav>
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <span className="rise grid size-20 shrink-0 place-items-center rounded-3xl bg-leaf-300 text-forest-900 sm:size-24">
              <ServiceIcon name={s.icon} className="size-11 sm:size-12" />
            </span>
            <div>
              <h1 className="rise font-display text-[clamp(38px,6vw,68px)] font-medium leading-[1.02] tracking-[-0.02em] text-forest-900 [font-variation-settings:'SOFT'_100,'opsz'_144]" style={{ ["--d" as string]: "90ms" }}>
                {s.title}
              </h1>
              <p className="rise mt-4 max-w-[60ch] text-[18px] leading-relaxed text-ink-soft" style={{ ["--d" as string]: "180ms" }}>{s.intro}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div className="space-y-14">
            <Reveal><Block title="Who this is for" items={s.whoFor} /></Reveal>
            <Reveal><Block title="How we work together" items={s.approach} /></Reveal>
            <Reveal><Block title="What you get" items={s.youGet} tone="check" /></Reveal>
            {s.faqs.length > 0 && (
              <Reveal>
                <h2 className="font-display text-[30px] text-forest-900">Common questions</h2>
                <div className="mt-5"><FaqList items={s.faqs} /></div>
              </Reveal>
            )}
            <p className="text-[13px] leading-relaxed text-ink-soft">
              This information is general and does not replace personal medical advice. Results vary from person to person and are not guaranteed.
            </p>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="card-paper rounded-[32px] p-7 sm:p-8">
                <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-forest-700/80">Start here</p>
                <h2 className="mt-2 font-display text-[28px] leading-tight text-forest-900">Book a consultation</h2>
                <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">Tell Dn. Bushra about your goals and get a plan made for you.</p>
                <div className="mt-6 grid gap-3">
                  <BookLink size="lg" className="w-full" />
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full border border-forest-700/35 font-semibold text-forest-900 transition hover:bg-mint-100">
                    <SocialIcon name="whatsapp" className="size-5" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </Reveal>
          </aside>
        </Container>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Also available" title="Other services" />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/services/${o.slug}`} className="group flex h-full items-center gap-4 rounded-3xl border border-leaf-400/30 bg-mint-50 p-5 transition hover:-translate-y-1 hover:bg-white">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-leaf-300/60 text-forest-800"><ServiceIcon name={o.icon} className="size-7" /></span>
                  <span className="font-display text-[20px] leading-tight text-forest-900">{o.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
