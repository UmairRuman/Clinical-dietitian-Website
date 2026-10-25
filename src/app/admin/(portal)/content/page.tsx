import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { FaqRow } from "@/components/admin/FaqRow";
import { btnSoft, inputCls, labelCls } from "@/components/admin/styles";
import { Badge, Card, PageTitle } from "@/components/admin/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/server/auth";
import { addFaq, addService, moveService, saveAbout } from "./actions";

export const metadata = { title: "Services, About & FAQs" };

// Private admin page: waits for the session by design.
export const instant = false;

export default async function ContentPage() {
  await requireAdmin();
  const db = createAdminClient();
  const [{ data: profile }, { data: services }, { data: faqs }] = await Promise.all([
    db.from("profile").select("about_long,bio").eq("id", 1).single(),
    db.from("services").select("id,title,short,visible,slug").order("sort_order"),
    db.from("faqs").select("id,question,answer,visible").order("sort_order"),
  ]);

  return (
    <>
      <PageTitle title="Services, About & FAQs" intro="The words on your About page, each service page and the questions people often ask." />
      <div className="space-y-8">
        <Card title="About page text">
          <ActionForm action={saveAbout} className="space-y-3">
            <label className="block">
              <span className={labelCls}>Your story (separate paragraphs with a blank line)</span>
              <textarea name="about" rows={9} defaultValue={profile?.about_long ?? ""} placeholder={profile?.bio} className={inputCls} />
            </label>
            <p className="text-sm text-ink-soft">Leave it empty to show the short bio from Profile.</p>
            <SubmitButton>Save About</SubmitButton>
          </ActionForm>
        </Card>

        <section>
          <h2 className="mb-3 font-display text-[22px] text-forest-900">Service pages</h2>
          <ul className="space-y-2.5">
            {services?.map((s, i) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-leaf-400/30 bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{s.title} {!s.visible && <span className="ml-2"><Badge status="hidden" /></span>}</p>
                  <p className="truncate text-sm text-ink-soft">/services/{s.slug}</p>
                </div>
                <form action={moveService.bind(null, s.id, "up")}><button disabled={i === 0} className={`${btnSoft} !min-h-9 !px-3`}>↑</button></form>
                <form action={moveService.bind(null, s.id, "down")}><button disabled={i === (services.length - 1)} className={`${btnSoft} !min-h-9 !px-3`}>↓</button></form>
                <Link href={`/admin/content/services/${s.id}`} className={`${btnSoft} !min-h-9`}>Edit</Link>
              </li>
            ))}
          </ul>
          <ActionForm action={addService} className="mt-4 flex flex-wrap items-end gap-3">
            <label className="block min-w-[220px] flex-1"><span className={labelCls}>New service</span><input name="title" required className={inputCls} placeholder="e.g. Child nutrition" /></label>
            <SubmitButton pending="Adding…">Add service</SubmitButton>
          </ActionForm>
        </section>

        <section>
          <h2 className="mb-3 font-display text-[22px] text-forest-900">Frequently asked questions</h2>
          <ul className="space-y-3">{faqs?.map((f, i) => <FaqRow key={f.id} faq={f} first={i === 0} last={i === faqs.length - 1} />)}</ul>
          <Card title="Add a question" className="mt-4">
            <ActionForm action={addFaq} resetOnSuccess className="space-y-3">
              <label className="block"><span className={labelCls}>Question</span><input name="question" required className={inputCls} /></label>
              <label className="block"><span className={labelCls}>Answer</span><textarea name="answer" rows={3} required className={inputCls} /></label>
              <SubmitButton pending="Adding…">Add question</SubmitButton>
            </ActionForm>
          </Card>
        </section>
      </div>
    </>
  );
}
