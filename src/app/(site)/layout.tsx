import { BookingProvider } from "@/components/booking/BookingProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FloatingWhatsApp } from "@/components/home/FloatingWhatsApp";
import { getServices, getWhatsappHref } from "@/server/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [whatsappHref, services] = await Promise.all([getWhatsappHref(), getServices()]);
  return (
    <BookingProvider whatsappHref={whatsappHref} concerns={services.map((s) => s.title)}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-forest-900 focus:px-5 focus:py-3 focus:text-white">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <FloatingWhatsApp href={whatsappHref} wide />
    </BookingProvider>
  );
}
