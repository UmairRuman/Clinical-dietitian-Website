import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getServices } from "@/server/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices();
  const pages = ["", "/about", "/services", "/stories", "/contact", "/links", "/privacy"];
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: `${siteUrl}/services/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
