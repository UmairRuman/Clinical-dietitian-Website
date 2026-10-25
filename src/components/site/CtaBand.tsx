import { Sprig } from "@/components/brand/Botanicals";
import { SocialIcon } from "@/components/brand/SocialIcon";
import { Reveal } from "@/components/ui/Reveal";
import { BookLink } from "./BookLink";
import { Container } from "./primitives";
import { whatsappHref } from "@/lib/seed";

export function CtaBand({ title = "Ready to feel your best?", text = "Book a session and take the first step towards your wellness goals." }: { title?: string; text?: string }) {
  return (
    <section className="py-8 sm:py-14">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] bg-forest-900 px-6 py-14 text-center sm:rounded-[48px] sm:px-14 sm:py-20">
            <Sprig className="pointer-events-none absolute -left-6 bottom-[-40px] h-72 rotate-[-12deg] text-leaf-300/20" />
            <Sprig className="pointer-events-none absolute -right-6 top-[-50px] h-72 -scale-x-100 rotate-[160deg] text-leaf-300/20" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-60 w-[70%] -translate-x-1/2 rounded-full bg-leaf-500/25 blur-[90px]" />
            <h2 className="relative mx-auto max-w-[20ch] font-display text-[clamp(32px,5vw,56px)] font-medium leading-[1.06] text-white [font-variation-settings:'SOFT'_100,'opsz'_144]">{title}</h2>
            <p className="relative mx-auto mt-4 max-w-[48ch] text-[17px] leading-relaxed text-mint-200/90">{text}</p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BookLink size="lg" />
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-16 items-center gap-2.5 rounded-full border border-mint-200/35 px-8 text-[15px] font-semibold text-white transition hover:bg-white/10"
              >
                <SocialIcon name="whatsapp" className="size-5" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
