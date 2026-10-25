import Link from "next/link";
import { btnPrimary, btnSoft } from "@/components/admin/styles";
import { Card, Empty, PageTitle } from "@/components/admin/ui";
import { StoriesCarousel } from "@/components/home/StoriesCarousel";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicStory } from "@/lib/types";
import { requireAdmin } from "@/server/auth";
import { feature, unfeature } from "../moderation/actions";
import { moveFeatured } from "./actions";

export const metadata = { title: "Homepage stories" };
const LIMIT = 6;

// Private admin page: waits for the session by design.
export const instant = false;

export default async function CurationPage() {
  await requireAdmin();
  const db = createAdminClient();
  const [{ data: featured }, { data: approved }] = await Promise.all([
    db.from("submissions").select("id,type,display_name,rating,body,result_summary,created_at").eq("status", "featured").order("featured_order", { ascending: true, nullsFirst: false }),
    db.from("submissions").select("id,type,display_name,rating,body,created_at").eq("status", "approved").order("created_at", { ascending: false }).limit(50),
  ]);
  const preview: PublicStory[] = (featured ?? []).map((s) => ({
    id: s.id, type: s.type, name: s.display_name, rating: s.rating ?? undefined, text: s.body, result: s.result_summary ?? undefined, date: s.created_at, images: [], featured: true,
  }));

  return (
    <>
      <PageTitle
        title="Homepage stories"
        intro={`Choose which approved stories appear on the homepage and in what order. We suggest ${LIMIT} or fewer so the page stays fast.`}
        actions={<Link href="/admin/moderation" className={btnSoft}>Review new submissions</Link>}
      />
      <div className="space-y-6">
        <Card title={`On the homepage (${featured?.length ?? 0})`}>
          {(featured?.length ?? 0) > LIMIT && <p className="mb-3 rounded-xl bg-[#fdf1d8] px-4 py-2.5 text-sm text-[#8a5a00]">Only the first {LIMIT} are shown on the homepage.</p>}
          {featured?.length ? (
            <ul className="divide-y divide-leaf-400/20">
              {featured.map((s, i) => (
                <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-leaf-300 text-sm font-bold">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{s.display_name} <span className="font-normal text-ink-soft">· {s.type}</span></p>
                    <p dir="auto" className="line-clamp-1 text-sm text-ink-soft">{s.body}</p>
                  </div>
                  <form action={moveFeatured.bind(null, s.id, "up")}><button disabled={i === 0} className={`${btnSoft} !min-h-9 !px-3`}>↑</button></form>
                  <form action={moveFeatured.bind(null, s.id, "down")}><button disabled={i === featured.length - 1} className={`${btnSoft} !min-h-9 !px-3`}>↓</button></form>
                  <form action={unfeature.bind(null, s.id)}><button className={`${btnSoft} !min-h-9`}>Remove</button></form>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No stories are featured yet. Pick some from the list below.</Empty>
          )}
        </Card>

        <Card title="Approved, not on the homepage">
          {approved?.length ? (
            <ul className="divide-y divide-leaf-400/20">
              {approved.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{s.display_name} <span className="font-normal text-ink-soft">· {s.type}</span></p>
                    <p dir="auto" className="line-clamp-1 text-sm text-ink-soft">{s.body}</p>
                  </div>
                  <form action={feature.bind(null, s.id)}><button className={`${btnPrimary} !min-h-9`}>Feature</button></form>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Approve reviews first, then feature the best ones here.</Empty>
          )}
        </Card>

        {preview.length > 0 && (
          <Card title="Live preview">
            <div className="overflow-hidden"><StoriesCarousel stories={preview.slice(0, LIMIT)} wide /></div>
          </Card>
        )}
      </div>
    </>
  );
}
