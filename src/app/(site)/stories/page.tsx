import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";
import { StoriesBrowser } from "@/components/stories/StoriesBrowser";
import { getApprovedStories } from "@/server/content";

export const metadata: Metadata = { title: "Client Testimonials" };

export default async function StoriesPage() {
  const stories = await getApprovedStories();
  return (
    <PageShell wide eyebrow="Testimonials" title="Reviews & Success Stories" intro="Words from clients who trusted Dn. Bushra with their wellness goals.">
      <StoriesBrowser stories={stories} />
    </PageShell>
  );
}
