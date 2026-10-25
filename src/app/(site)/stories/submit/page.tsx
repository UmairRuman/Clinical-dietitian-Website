import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";
import { SubmitForm } from "@/components/stories/SubmitForm";

export const metadata: Metadata = { title: "Share your story" };

export default function SubmitPage() {
  return (
    <PageShell eyebrow="Your voice" title="Share your story" intro="Your experience can inspire someone who is just starting out.">
      <SubmitForm />
    </PageShell>
  );
}
