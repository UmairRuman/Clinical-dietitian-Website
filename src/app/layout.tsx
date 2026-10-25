import type { Metadata, Viewport } from "next";
import { Fraunces, Figtree, Noto_Nastaliq_Urdu } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const nastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-nastaliq",
  subsets: ["arabic"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  openGraph: { type: "website", siteName: "Dn. Bushra Naseem", locale: "en_PK" },
  title: {
    default: "Dn. Bushra Naseem | Clinical Dietitian",
    template: "%s | Dn. Bushra Naseem",
  },
  description:
    "Achieve your wellness goals with personalised, practical nutrition plans. Book a consultation with Dn. Bushra Naseem, Clinical Dietitian.",
};

export const viewport: Viewport = {
  themeColor: "#e4f3e6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${figtree.variable} ${nastaliq.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
