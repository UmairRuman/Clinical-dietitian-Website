import Link from "next/link";
import { VineDivider } from "@/components/brand/Botanicals";
import type { Profile } from "@/server/content";

export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="mt-16 pb-28 text-center">
      <VineDivider className="mx-auto h-5 w-44" />
      <p className="mt-5 font-display text-xl text-forest-900">{profile.name}</p>
      <address className="mt-3 space-y-1 text-[15px] not-italic text-ink-soft">
        <a href={profile.phoneHref} className="block py-1 hover:text-forest-700">
          {profile.phone}
        </a>
        <a href={`mailto:${profile.email}`} className="block break-all py-1 hover:text-forest-700">
          {profile.email}
        </a>
        {profile.address && <p>{profile.address}</p>}
      </address>
      <p className="mt-5 text-sm text-ink-soft">
        <Link href="/privacy" className="underline decoration-leaf-400 underline-offset-4 hover:text-forest-700">
          Privacy policy
        </Link>
        <span aria-hidden className="mx-2">·</span>
        © 2026 {profile.name}
      </p>
    </footer>
  );
}
