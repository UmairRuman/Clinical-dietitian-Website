import type { Metadata } from "next";
import Link from "next/link";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { CtaBand } from "@/components/site/CtaBand";
import { Container, PageHero } from "@/components/site/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { getServices } from "@/server/content";

export const metadata: Metadata = {
  title: "Services",
  description: "Weight management, diabetic diet plans, uric acid, hypo/hypertension, sports nutrition and PCOS diet plans with Dn. Bushra Naseem.",
};

export default async function ServicesPage() {
  const serviceDetails = await getServices();
  return (
    <>
      <PageHero eyebrow="Services" title="Nutrition plans built around you" intro="Choose the area that matches your goal. Every plan is personalised, practical and reviewed with you over time." />
      <section className="py-20 sm:py-24">
        <Container>
          <ul className="grid gap-6 md:grid-cols-2">
            {serviceDetails.map((s, i) => (
              <li key={s.slug}>
                <Reveal delay={(i % 2) * 0.08} className="h-full">
                  <Link
                    href={`/services/${s.slug}`}
                    className="group flex h-full gap-6 rounded-[28px] border border-leaf-400/30 bg-paper p-7 transition duration-500 hover:-translate-y-1 hover:border-leaf-500/60 hover:shadow-[0_30px_50px_-30px_rgba(36,85,58,0.5)] sm:p-8"
                  >
                    <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-leaf-300/60 text-forest-800 transition duration-500 group-hover:rotate-[-6deg] group-hover:bg-leaf-300">
                      <ServiceIcon name={s.icon} className="size-9" />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-display text-[28px] leading-tight text-forest-900">{s.title}</span>
                      <span className="mt-2 text-[16.5px] leading-relaxed text-ink-soft">{s.short}</span>
                      <span className="mt-4 inline-flex items-center gap-2 text-[14px] font-bold uppercase tracking-[0.1em] text-forest-700">
                        Details <span aria-hidden className="transition group-hover:translate-x-1.5">→</span>
                      </span>
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
