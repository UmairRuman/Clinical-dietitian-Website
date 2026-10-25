import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { btnDanger, inputCls, labelCls } from "@/components/admin/styles";
import { Card, PageTitle } from "@/components/admin/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/server/auth";
import { deleteService, saveService } from "../../actions";

const ICONS: [string, string][] = [["weight", "Scale"], ["diabetes", "Drop"], ["uric", "Crystals"], ["pressure", "Heart"], ["sports", "Dumbbell"], ["pcos", "Flower"]];

// Private admin page: waits for the session by design.
export const instant = false;

export default async function EditServicePage({ params }: PageProps<"/admin/content/services/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { data: s } = await createAdminClient().from("services").select("*").eq("id", id).maybeSingle();
  if (!s) notFound();
  const faqText = ((s.faqs as { q: string; a: string }[]) ?? []).map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");

  return (
    <>
      <PageTitle title={s.title} intro={`Edits this page: /services/${s.slug}`} actions={<Link href="/admin/content" className="text-sm font-semibold text-forest-700 underline underline-offset-4">← Back to content</Link>} />
      <Card>
        <ActionForm action={saveService.bind(null, s.id)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <label className="block"><span className={labelCls}>Service name</span><input name="title" defaultValue={s.title} required className={inputCls} /></label>
            <label className="block">
              <span className={labelCls}>Icon</span>
              <select name="icon" defaultValue={s.icon} className={inputCls}>{ICONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
          </div>
          <label className="block"><span className={labelCls}>Short description (shown on cards)</span><input name="short" defaultValue={s.short} required className={inputCls} /></label>
          <label className="block"><span className={labelCls}>Introduction</span><textarea name="intro" defaultValue={s.intro} rows={4} required className={inputCls} /></label>
          <label className="block"><span className={labelCls}>Who this is for (one point per line)</span><textarea name="whoFor" defaultValue={(s.who_for ?? []).join("\n")} rows={5} className={inputCls} /></label>
          <label className="block"><span className={labelCls}>How we work together (one point per line)</span><textarea name="approach" defaultValue={(s.approach ?? []).join("\n")} rows={5} className={inputCls} /></label>
          <label className="block"><span className={labelCls}>What you get (one point per line)</span><textarea name="youGet" defaultValue={(s.you_get ?? []).join("\n")} rows={5} className={inputCls} /></label>
          <label className="block">
            <span className={labelCls}>Questions for this page</span>
            <textarea name="faqs" defaultValue={faqText} rows={8} className={`${inputCls} font-mono text-[13.5px]`} placeholder={"Q: Your question?\nA: Your answer.\n\nQ: Another question?\nA: Another answer."} />
            <span className="mt-1 block text-[13px] text-ink-soft">Start each with Q: and A:, and leave a blank line between questions.</span>
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="visible" defaultChecked={s.visible} className="size-5 accent-[#2f6b45]" /> Show this service on the website</label>
          <SubmitButton>Save service</SubmitButton>
        </ActionForm>
      </Card>
      <form action={deleteService.bind(null, s.id)} className="mt-6">
        <button className={btnDanger}>Delete this service</button>
      </form>
    </>
  );
}
