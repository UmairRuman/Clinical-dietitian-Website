import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { LinkRow, type LinkRowData } from "@/components/admin/LinkRow";
import { inputCls, labelCls } from "@/components/admin/styles";
import { Card, PageTitle } from "@/components/admin/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/server/auth";
import { addLink } from "./actions";

export const metadata = { title: "Links & buttons" };

// Private admin page: waits for the session by design.
export const instant = false;

export default async function LinksAdminPage() {
  await requireAdmin();
  const { data } = await createAdminClient().from("links").select("id,kind,label,url,action,visible,sort_order").order("sort_order");
  const rows = (data ?? []) as (LinkRowData & { sort_order: number })[];
  const social = rows.filter((r) => r.kind === "social");
  const buttons = rows.filter((r) => r.kind === "button");

  return (
    <>
      <PageTitle title="Links & buttons" intro="Change where the social icons and buttons go, rename them, hide them or reorder them. Updates appear on the website straight away." />
      <div className="space-y-8">
        <section>
          <h2 className="mb-3 font-display text-[22px] text-forest-900">Social icons</h2>
          <ul className="space-y-3">{social.map((l, i) => <LinkRow key={l.id} link={l} first={i === 0} last={i === social.length - 1} />)}</ul>
        </section>
        <section>
          <h2 className="mb-3 font-display text-[22px] text-forest-900">Buttons (link-in-bio page)</h2>
          <ul className="space-y-3">{buttons.map((l, i) => <LinkRow key={l.id} link={l} first={i === 0} last={i === buttons.length - 1} />)}</ul>
        </section>
        <Card title="Add a button">
          <ActionForm action={addLink} resetOnSuccess className="grid gap-3 sm:grid-cols-[1fr_1.6fr_auto] sm:items-end">
            <label className="block"><span className={labelCls}>Label</span><input name="label" required className={inputCls} placeholder="e.g. Free diet chart" /></label>
            <label className="block"><span className={labelCls}>Link</span><input name="url" required className={inputCls} placeholder="https://…" /></label>
            <SubmitButton pending="Adding…">Add button</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
