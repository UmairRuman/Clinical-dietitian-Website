import { Suspense } from "react";
import Link from "next/link";
import { AdminNav, type NavItem } from "@/components/admin/AdminNav";
import { logout } from "@/app/admin/actions";
import { getAdminCounts } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";

async function Shell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const counts = await getAdminCounts();

  const items: NavItem[] = [
    { href: "/admin", label: "Dashboard", group: "main" },
    { href: "/admin/bookings", label: "Bookings", group: "main" },
    { href: "/admin/requests", label: "Booking requests", badge: counts.newRequests, group: "main" },
    { href: "/admin/moderation", label: "Reviews & stories", badge: counts.pendingSubmissions, group: "main" },
    { href: "/admin/curation", label: "Homepage stories", group: "main" },
    { href: "/admin/profile", label: "Profile & photo", group: "site" },
    { href: "/admin/links", label: "Links & buttons", group: "site" },
    { href: "/admin/content", label: "Services, About & FAQs", group: "site" },
    { href: "/admin/settings", label: "Settings", group: "site" },
  ];

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[264px_1fr]">
      <aside className="bg-forest-900 pt-4 text-mint-100 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:pt-6">
        <div className="flex items-center justify-between px-5 pb-3 lg:flex-col lg:items-start lg:gap-1 lg:pb-5">
          <div>
            <p className="font-display text-[20px] font-semibold text-white">Dn. Bushra Naseem</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-leaf-300">Admin portal</p>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/" target="_blank" className="rounded-full border border-mint-200/30 px-3 py-1.5 text-[13px] font-semibold">View site</Link>
            <form action={logout}>
              <button className="rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-semibold">Sign out</button>
            </form>
          </div>
        </div>
        <AdminNav items={items} />
        <div className="hidden border-t border-white/10 p-4 lg:block">
          <p className="truncate px-1 text-[13px] text-mint-200/70">{admin.email}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/" target="_blank" className="flex-1 rounded-full border border-mint-200/30 px-3 py-2 text-center text-[13px] font-semibold hover:bg-white/10">View site</Link>
            <form action={logout} className="flex-1">
              <button className="w-full rounded-full bg-white/10 px-3 py-2 text-[13px] font-semibold hover:bg-white/20">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 bg-mint-50/60">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}

// Private, authenticated area: it is expected to wait for the session, so skip instant-navigation validation.
export const instant = false;

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-ink-soft">Loading…</div>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
