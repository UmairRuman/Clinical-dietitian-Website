import { SocialIcon } from "@/components/brand/SocialIcon";

export function FloatingWhatsApp({ href, wide }: { href: string; wide?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={`pop fixed bottom-5 right-4 z-40 grid size-14 place-items-center rounded-full bg-forest-700 text-white shadow-[0_14px_30px_-8px_rgba(23,58,38,0.65)] transition hover:scale-105 hover:bg-forest-800 active:scale-95 ${wide ? "" : "lg:right-[calc(50%-260px-84px)]"}`}
      style={{ ["--d" as string]: "1900ms" }}
    >
      <SocialIcon name="whatsapp" className="size-7" />
    </a>
  );
}
