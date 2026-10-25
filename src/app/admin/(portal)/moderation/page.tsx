/* eslint-disable @next/next/no-img-element -- admin previews use signed URLs for private images */
import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { btnDanger, btnPrimary, btnSoft, inputCls, labelCls } from "@/components/admin/styles";
import { Badge, Card, Empty, PageTitle } from "@/components/admin/ui";
import { StoryCard } from "@/components/stories/StoryCard";
import { createAdminClient } from "@/lib/supabase/admin";
import { storagePublicUrl } from "@/lib/supabase/env";
import { fmtDateTime } from "@/lib/dates";
import { requireAdmin } from "@/server/auth";
import { addManualStory, approve, bulkApprove, bulkReject, feature, hide, reject, remove, restore, saveSubmission, unfeature } from "./actions";

export const metadata = { title: "Reviews & stories" };

const STATUSES = ["all", "pending", "approved", "featured", "rejected", "hidden", "deleted"] as const;
type SP = { status?: string; type?: string; rating?: string; q?: string; open?: string };

const stars = (n: number | null) => (n ? "★".repeat(n) + "☆".repeat(5 - n) : "");

// Private admin page: waits for the session by design.
export const instant = false;

export default async function ModerationPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = (STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "pending";
  const db = createAdminClient();

  let query = db.from("submissions").select("id,type,display_name,real_name,rating,body,status,created_at").order("created_at", { ascending: false }).limit(100);
  if (status !== "all") query = query.eq("status", status);
  else query = query.neq("status", "deleted");
  if (sp.type === "review" || sp.type === "story") query = query.eq("type", sp.type);
  if (sp.rating && /^[1-5]$/.test(sp.rating)) query = query.eq("rating", Number(sp.rating));
  const q = (sp.q ?? "").replace(/[,()%*]/g, " ").trim();
  if (q) query = query.or(`body.ilike.%${q}%,display_name.ilike.%${q}%,real_name.ilike.%${q}%`);
  const { data: rows } = await query;

  const openId = sp.open && /^[0-9a-f-]{36}$/.test(sp.open) ? sp.open : null;
  const open = openId ? (await db.from("submissions").select("*").eq("id", openId).maybeSingle()).data : null;
  let imageSrcs: string[] = [];
  if (open) {
    const { data: imgs } = await db.from("submission_images").select("path").eq("submission_id", open.id).order("sort_order");
    const paths = (imgs ?? []).map((i) => i.path);
    if (open.status === "approved" || open.status === "featured") imageSrcs = paths.map((p) => storagePublicUrl("stories", p));
    else if (paths.length) {
      const { data: signed } = await db.storage.from("stories-pending").createSignedUrls(paths, 3600);
      imageSrcs = (signed ?? []).map((s) => s.signedUrl).filter((u): u is string => Boolean(u));
    }
  }
  const keep = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const all = { status, type: sp.type, rating: sp.rating, q: sp.q, ...extra };
    Object.entries(all).forEach(([k, v]) => v && p.set(k, v));
    return `/admin/moderation?${p}`;
  };

  return (
    <>
      <PageTitle title="Reviews & stories" intro="Only items you approve are shown to the public. Open an item to edit the wording, then approve, feature, hide or delete it." />

      <form className="mb-5 grid gap-3 rounded-2xl border border-leaf-400/30 bg-white p-4 sm:grid-cols-[1fr_1fr_1fr_1.4fr_auto]" action="/admin/moderation">
        <label className="block"><span className={labelCls}>Status</span>
          <select name="status" defaultValue={status} className={inputCls}>{STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All (not deleted)" : s}</option>)}</select></label>
        <label className="block"><span className={labelCls}>Type</span>
          <select name="type" defaultValue={sp.type ?? ""} className={inputCls}><option value="">Any</option><option value="review">Review</option><option value="story">Success story</option></select></label>
        <label className="block"><span className={labelCls}>Rating</span>
          <select name="rating" defaultValue={sp.rating ?? ""} className={inputCls}><option value="">Any</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}</select></label>
        <label className="block"><span className={labelCls}>Search</span><input name="q" defaultValue={sp.q ?? ""} className={inputCls} placeholder="Name or words" /></label>
        <div className="flex items-end"><button className={btnPrimary}>Filter</button></div>
      </form>

      {open && (
        <Card className="mb-6 border-forest-700/30" title={`${open.type === "review" ? "Review" : "Success story"} from ${open.real_name}`} action={<Link href={keep({ open: undefined })} className="text-sm font-semibold text-forest-700 underline underline-offset-4">Close</Link>}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2"><Badge status={open.status} /><span className="text-sm text-ink-soft">{fmtDateTime(open.created_at)}</span></div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="font-semibold text-forest-700">Real name</dt><dd>{open.real_name}</dd>
                <dt className="font-semibold text-forest-700">Private contact</dt><dd className="break-all">{open.private_contact}</dd>
                <dt className="font-semibold text-forest-700">Shown as</dt><dd>{open.display_name} <span className="text-ink-soft">({open.name_pref})</span></dd>
                <dt className="font-semibold text-forest-700">Photo consent</dt><dd>{open.consent_photos ? "Yes" : "No photos"}</dd>
                {open.rejection_reason && (<><dt className="font-semibold text-forest-700">Rejected because</dt><dd>{open.rejection_reason}</dd></>)}
              </dl>
              {imageSrcs.length > 0 && (
                <ul className="flex flex-wrap gap-2">{imageSrcs.map((src, i) => <li key={i}><a href={src} target="_blank" rel="noopener noreferrer"><img src={src} alt={`Photo ${i + 1}`} className="size-24 rounded-xl object-cover" /></a></li>)}</ul>
              )}
              <details className="rounded-xl bg-mint-50 p-3 text-sm">
                <summary className="cursor-pointer font-semibold text-forest-700">Original submission</summary>
                <p dir="auto" className="mt-2 whitespace-pre-wrap">{open.original_body}</p>
              </details>
              <ActionForm action={saveSubmission.bind(null, open.id)} className="space-y-3">
                <label className="block"><span className={labelCls}>Name shown publicly</span><input name="displayName" defaultValue={open.display_name} required className={inputCls} /></label>
                {open.type === "review" && <label className="block"><span className={labelCls}>Rating</span><select name="rating" defaultValue={open.rating ?? ""} className={inputCls}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}</select></label>}
                {open.type === "story" && <label className="block"><span className={labelCls}>Result line</span><input name="result" defaultValue={open.result_summary ?? ""} className={inputCls} placeholder="Lost 4 kg in 3 weeks" /></label>}
                <label className="block"><span className={labelCls}>Text</span><textarea name="body" dir="auto" rows={6} defaultValue={open.body} required className={inputCls} /></label>
                <SubmitButton>Save wording</SubmitButton>
              </ActionForm>
            </div>

            <div className="space-y-4">
              <div>
                <p className={labelCls}>Preview as visitors will see it</p>
                <div className="max-w-[420px]">
                  <StoryCard story={{ id: open.id, type: open.type, name: open.display_name, rating: open.rating ?? undefined, text: open.body, result: open.result_summary ?? undefined, date: open.created_at, images: [], featured: open.status === "featured" }} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(open.status === "pending" || open.status === "hidden" || open.status === "rejected") && <form action={approve.bind(null, open.id)}><button className={btnPrimary}>Approve</button></form>}
                {open.status === "approved" && <form action={feature.bind(null, open.id)}><button className={btnPrimary}>Feature on homepage</button></form>}
                {open.status === "featured" && <form action={unfeature.bind(null, open.id)}><button className={btnSoft}>Remove from homepage</button></form>}
                {(open.status === "approved" || open.status === "featured") && <form action={hide.bind(null, open.id)}><button className={btnSoft}>Hide</button></form>}
                {(open.status === "deleted" || open.status === "rejected") && <form action={restore.bind(null, open.id)}><button className={btnSoft}>Restore to pending</button></form>}
                {open.status !== "deleted" && <form action={remove.bind(null, open.id)}><ConfirmButton message="Delete this item? You can restore it for 30 days." className={btnDanger}>Delete</ConfirmButton></form>}
              </div>
              {(open.status === "pending" || open.status === "approved" || open.status === "featured" || open.status === "hidden") && (
                <form action={reject.bind(null, open.id)} className="flex flex-wrap items-end gap-2">
                  <label className="block min-w-[200px] flex-1"><span className={labelCls}>Reject with a reason (optional)</span><input name="reason" className={inputCls} placeholder="Only you see this" /></label>
                  <button className={btnDanger}>Reject</button>
                </form>
              )}
            </div>
          </div>
        </Card>
      )}

      <form className="rounded-2xl border border-leaf-400/30 bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-leaf-400/25 p-3">
          <span className="px-2 text-sm text-ink-soft">{rows?.length ?? 0} item(s). Tick several to act on them together.</span>
          <button formAction={bulkApprove} className={`${btnPrimary} !min-h-9 ml-auto`}>Approve selected</button>
          <button formAction={bulkReject} className={`${btnDanger} !min-h-9`}>Reject selected</button>
        </div>
        {rows?.length ? (
          <ul className="divide-y divide-leaf-400/20">
            {rows.map((r) => (
              <li key={r.id} className="flex items-start gap-3 p-3 sm:p-4">
                <input type="checkbox" name="ids" value={r.id} aria-label={`Select ${r.real_name}`} className="mt-1.5 size-5 accent-[#2f6b45]" />
                <Link href={keep({ open: r.id })} className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{r.real_name}</span>
                    {r.display_name !== r.real_name && <span className="text-sm text-ink-soft">shown as {r.display_name}</span>}
                    <span className="text-sm text-ink-soft">· {r.type}</span>
                    {r.rating && <span className="text-sm text-clay">{stars(r.rating)}</span>}
                  </span>
                  <span dir="auto" className="mt-0.5 line-clamp-2 block text-sm text-ink-soft">{r.body}</span>
                  <span className="mt-1 block text-xs text-ink-soft">{fmtDateTime(r.created_at)}</span>
                </Link>
                <Badge status={r.status} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4"><Empty>Nothing here with these filters.</Empty></div>
        )}
      </form>

      <details className="mt-8">
        <summary className="cursor-pointer font-display text-[20px] text-forest-900">Add a story yourself</summary>
        <Card className="mt-3">
          <p className="mb-4 text-sm text-ink-soft">For example from a WhatsApp message a client shared. It is published straight away, so make sure you have their permission.</p>
          <ActionForm action={addManualStory} resetOnSuccess className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block"><span className={labelCls}>Type</span><select name="type" className={inputCls}><option value="story">Success story</option><option value="review">Review</option></select></label>
              <label className="block"><span className={labelCls}>Name shown</span><input name="name" required className={inputCls} placeholder="Hina R." /></label>
              <label className="block"><span className={labelCls}>Rating (reviews)</span><select name="rating" className={inputCls}><option value="">-</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}</select></label>
            </div>
            <label className="block"><span className={labelCls}>Text</span><textarea name="body" dir="auto" rows={4} required className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Result line (optional)</span><input name="result" className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Photos (optional, up to 3)</span><input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple className="text-sm" /></label>
            <SubmitButton pending="Publishing…">Add and publish</SubmitButton>
          </ActionForm>
        </Card>
      </details>
    </>
  );
}
