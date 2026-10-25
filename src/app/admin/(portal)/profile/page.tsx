import Image from "next/image";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { inputCls, labelCls, btnSoft } from "@/components/admin/styles";
import { Card, PageTitle } from "@/components/admin/ui";
import { ProfilePortrait } from "@/components/home/ProfilePortrait";
import { createAdminClient } from "@/lib/supabase/admin";
import { storagePublicUrl } from "@/lib/supabase/env";
import { requireAdmin } from "@/server/auth";
import { restorePhoto, saveProfile } from "./actions";

export const metadata = { title: "Profile & photo" };

// Private admin page: waits for the session by design.
export const instant = false;

export default async function ProfilePage() {
  await requireAdmin();
  const db = createAdminClient();
  const [{ data: p }, { data: photos }] = await Promise.all([
    db.from("profile").select("*").eq("id", 1).single(),
    db.from("profile_photos").select("id,path,is_current,created_at").order("created_at", { ascending: false }).limit(5),
  ]);
  if (!p) return <p>Profile not found. Run the database seed.</p>;
  const photoUrl = p.photo_path ? storagePublicUrl("profile", p.photo_path) : null;

  return (
    <>
      <PageTitle title="Profile & photo" intro="Your name, tagline and photo appear on the homepage and the link-in-bio page. Changes go live as soon as you save." />
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <Card title="Profile photo">
            <ProfilePortrait photoUrl={photoUrl} alt={p.photo_alt ?? "Profile photo"} className="size-[240px]" sizes="240px" />
            <p className="mt-4 text-sm text-ink-soft">Upload a JPG, PNG or WebP up to 5 MB. You can crop it into a circle before saving.</p>
            <div className="mt-4"><PhotoUploader /></div>
          </Card>
          {!!photos?.length && (
            <Card title="Previous photos">
              <ul className="grid grid-cols-3 gap-3">
                {photos.map((ph) => (
                  <li key={ph.id} className="text-center">
                    <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full ring-2 ring-leaf-300">
                      <Image src={storagePublicUrl("profile", ph.path)} alt="" fill sizes="100px" className="object-cover" />
                    </div>
                    {ph.is_current ? (
                      <p className="mt-2 text-xs font-bold text-forest-700">Current</p>
                    ) : (
                      <form action={restorePhoto.bind(null, ph.id)} className="mt-2">
                        <button className="text-xs font-semibold text-forest-700 underline underline-offset-4">Restore</button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <Card title="Details">
          <ActionForm action={saveProfile} className="space-y-4">
            <label className="block"><span className={labelCls}>Name</span><input name="name" defaultValue={p.name} required className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Experience line</span><input name="experience" defaultValue={p.experience_line} required className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Tagline</span><input name="tagline" defaultValue={p.tagline} required className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Short bio</span><textarea name="bio" defaultValue={p.bio} rows={4} required className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Photo description (for screen readers)</span><input name="photoAlt" defaultValue={p.photo_alt ?? ""} className={inputCls} /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className={labelCls}>Contact email</span><input name="email" type="email" defaultValue={p.contact_email} required className={inputCls} /></label>
              <label className="block"><span className={labelCls}>Phone</span><input name="phone" defaultValue={p.contact_phone} required className={inputCls} /></label>
              <label className="block"><span className={labelCls}>WhatsApp number (optional)</span><input name="whatsapp" defaultValue={p.whatsapp_number ?? ""} placeholder="+92 ..." className={inputCls} /></label>
              <label className="block"><span className={labelCls}>Clinic address (optional)</span><input name="address" defaultValue={p.address ?? ""} className={inputCls} /></label>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <SubmitButton>Save changes</SubmitButton>
              <a href="/" target="_blank" className={btnSoft}>Preview site</a>
            </div>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
