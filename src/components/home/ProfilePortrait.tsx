import Image from "next/image";
import { Wreath, Sprig } from "@/components/brand/Botanicals";

export function ProfilePortrait({ photoUrl, alt, className = "size-[min(62vw,248px)]", sizes = "248px" }: { photoUrl: string | null; alt: string; className?: string; sizes?: string }) {
  return (
    <div className={`relative mx-auto ${className}`}>
      {/* breathing glow */}
      <div
        aria-hidden
        className="absolute inset-[6%] rounded-full bg-leaf-300 blur-2xl"
        style={{ animation: "breathe 6s ease-in-out infinite" }}
      />
      <div
        className="absolute inset-[13.3%] [container-type:size] overflow-hidden rounded-full bg-mint-200 shadow-[0_18px_40px_-14px_rgba(36,85,58,0.55)] ring-[5px] ring-paper"
      >
        {photoUrl ? (
          <Image src={photoUrl} alt={alt} fill priority sizes={sizes} className="object-cover" />
        ) : (
          <div role="img" aria-label={alt} className="relative grid size-full place-items-center bg-[radial-gradient(circle_at_30%_25%,#f3faf3,#cfe9d4_70%)]">
            <Sprig className="absolute -bottom-3 -left-2 h-[62%] text-forest-700/25" />
            <Sprig className="absolute -right-3 -top-4 h-[55%] -scale-x-100 rotate-[160deg] text-leaf-500/40" />
            <span className="relative font-display text-[26cqw] font-medium tracking-tight text-forest-700 [font-variation-settings:'SOFT'_100,'opsz'_144]">
              BN
            </span>
          </div>
        )}
      </div>
      <Wreath className="absolute inset-0 size-full" />
    </div>
  );
}
