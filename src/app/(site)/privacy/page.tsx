import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";
import { getProfile } from "@/server/content";

export const metadata: Metadata = { title: "Privacy Policy" };

const sections = (email: string) => [
  ["What we collect", "Only what is needed: your name and contact details when you send an enquiry, and your name, private contact, review text and optional photos when you submit a review or story."],
  ["How it is used", "Enquiries are used to arrange your consultation. Reviews and photos are published only after you consent and after they are approved. Your private contact details are never shown publicly."],
  ["Photos", "Uploaded photos are resized and have location (EXIF) data removed before storage."],
  ["Your rights", `You can ask for your data or a published review to be changed or deleted at any time by emailing ${email}.`],
  ["Health information", "Results shared by clients vary from person to person and are not a guarantee. Content on this site is not a substitute for personal medical advice."],
];

export default async function PrivacyPage() {
  const profile = await getProfile();
  return (
    <PageShell eyebrow="Legal" title="Privacy Policy" intro="Draft text, to be reviewed and approved by the client before launch.">
      <div className="space-y-6">
        {sections(profile.email).map(([h, p]) => (
          <section key={h}>
            <h2 className="font-display text-[22px] text-forest-900">{h}</h2>
            <p className="mt-1.5 leading-[1.75] text-forest-900/85">{p}</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
