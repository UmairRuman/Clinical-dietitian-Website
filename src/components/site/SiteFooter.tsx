import Link from "next/link";
import { Sprig } from "@/components/brand/Botanicals";
import { SocialIcon } from "@/components/brand/SocialIcon";
import { Container } from "./primitives";
import { getProfile, getServices, getSocials } from "@/server/content";

const col = "text-[15px] text-mint-200/85 transition hover:text-white";

export async function SiteFooter() {
  const [profile, services, socials] = await Promise.all([getProfile(), getServices(), getSocials()]);
  return (
    <footer className="relative mt-0 overflow-hidden bg-forest-900 text-mint-100">
      <Sprig className="pointer-events-none absolute -right-8 -top-10 h-80 rotate-[20deg] text-leaf-300/15" />
      <Sprig className="pointer-events-none absolute -bottom-16 left-[-30px] h-72 -scale-x-100 text-leaf-300/10" />
      <Container className="relative pb-10 pt-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr]">
          <div>
            <p className="font-display text-[28px] font-medium text-white [font-variation-settings:'SOFT'_100,'opsz'_72]">{profile.name}</p>
            <p className="mt-1 text-leaf-300">Clinical Dietitian</p>
            <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-mint-200/80">{profile.tagline}. Personalised, practical and sustainable nutrition plans.</p>
            <ul className="mt-6 flex gap-2.5">
              {socials.map((s) => (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid size-11 place-items-center rounded-full border border-mint-200/25 text-mint-100 transition hover:border-transparent hover:bg-leaf-300 hover:text-forest-900"
                  >
                    <SocialIcon name={s.key} className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Explore">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.22em] text-leaf-300">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {[["Home", "/"], ["About", "/about"], ["Services", "/services"], ["Success Stories", "/stories"], ["Contact", "/contact"]].map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className={col}>{l}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.22em] text-leaf-300">Services</h2>
            <ul className="mt-4 space-y-2.5">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className={col}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[12px] font-bold uppercase tracking-[0.22em] text-leaf-300">Get in touch</h2>
            <address className="mt-4 space-y-2.5 not-italic">
              <a href={profile.phoneHref} className={`block ${col}`}>{profile.phone}</a>
              <a href={`mailto:${profile.email}`} className={`block break-all ${col}`}>{profile.email}</a>
              {profile.address && <p className="text-[15px] text-mint-200/85">{profile.address}</p>}
              <p className="text-[15px] text-mint-200/60">Consultations by WhatsApp, video call or in person.</p>
            </address>
          </div>
        </div>

        <div className="mt-14 border-t border-mint-200/15 pt-6 text-[13px] leading-relaxed text-mint-200/60">
          <p className="max-w-[80ch]">
            Disclaimer: Information on this website is for general education and does not replace personal medical advice. Results vary from person to person and are not
            guaranteed.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p>© 2026 {profile.name}. All rights reserved.</p>
            <p className="flex gap-5">
              <Link href="/privacy" className="hover:text-white">Privacy policy</Link>
              <Link href="/links" className="hover:text-white">Link in bio</Link>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
