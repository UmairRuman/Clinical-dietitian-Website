import type { Metadata } from "next";
import { SocialIcon } from "@/components/brand/SocialIcon";
import { EnquiryForm } from "@/components/booking/EnquiryForm";
import { Container, PageHero } from "@/components/site/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { getProfile, getServices, getWhatsappHref } from "@/server/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Book a consultation with Dn. Bushra Naseem by WhatsApp, phone, email or the enquiry form.",
};

const card = "group flex items-center gap-4 rounded-3xl border border-leaf-400/30 bg-paper p-5 transition hover:-translate-y-0.5 hover:border-leaf-500/60 hover:bg-white";

export default async function ContactPage() {
  const [profile, services, whatsappHref] = await Promise.all([getProfile(), getServices(), getWhatsappHref()]);
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's plan your first consultation" intro="Choose whichever way is easiest. We usually reply quickly and will confirm a time that suits you." />
      <section className="py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <ul className="space-y-4">
              <li>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={card}>
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-leaf-300 text-forest-900"><SocialIcon name="whatsapp" className="size-6" /></span>
                  <span><span className="block font-semibold">WhatsApp</span><span className="block text-[14.5px] text-ink-soft">Fastest way to book</span></span>
                </a>
              </li>
              <li>
                <a href={profile.phoneHref} className={card}>
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-leaf-300 text-forest-900">
                    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 4.5h3.5l1.7 4-2.2 1.5a11 11 0 0 0 5 5l1.5-2.2 4 1.7V18a2 2 0 0 1-2 2A15 15 0 0 1 3 6.500a2 2 0 0 1 2-2Z" />
                    </svg>
                  </span>
                  <span><span className="block font-semibold">{profile.phone}</span><span className="block text-[14.5px] text-ink-soft">Tap to call</span></span>
                </a>
              </li>
              <li>
                <a href={`mailto:${profile.email}`} className={card}>
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-leaf-300 text-forest-900"><SocialIcon name="email" className="size-6" /></span>
                  <span className="min-w-0"><span className="block break-all font-semibold">{profile.email}</span><span className="block text-[14.5px] text-ink-soft">Email</span></span>
                </a>
              </li>
            </ul>
            <p className="mt-8 max-w-[44ch] text-[15px] leading-relaxed text-ink-soft">
              Consultations are held by WhatsApp call or video, Zoom, Microsoft Teams or in person. Your details are kept private and used only to arrange your session.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card-paper rounded-[32px] p-7 sm:p-9">
              <EnquiryForm concerns={services.map((s) => s.title)} />
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
