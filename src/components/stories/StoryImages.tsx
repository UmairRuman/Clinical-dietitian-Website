"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { storagePublicUrl } from "@/lib/supabase/env";
import type { PublicStory } from "@/lib/types";

/** Thumbnails that open in a lightbox (Esc / click outside / arrows). */
export function StoryImages({ images, name }: { images: PublicStory["images"]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, images.length]);

  if (!images.length) return null;
  const alt = (i: number) => images[i].alt || `Photo shared by ${name}`;

  return (
    <>
      <ul className="mb-4 grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <li key={img.path}>
            <button onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1}`} className="relative block aspect-square w-full overflow-hidden rounded-xl">
              <Image src={storagePublicUrl("stories", img.path)} alt={alt(i)} fill sizes="120px" className="object-cover transition duration-500 hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>
      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-[80] grid place-items-center bg-forest-900/90 p-4 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <button aria-label="Close" className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/15 text-white" onClick={() => setOpen(null)}>×</button>
          {images.length > 1 && (
            <>
              <button aria-label="Previous photo" className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/15 text-white" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + images.length) % images.length); }}>‹</button>
              <button aria-label="Next photo" className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/15 text-white" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % images.length); }}>›</button>
            </>
          )}
          <div className="relative h-[80dvh] w-full max-w-[900px]" onClick={(e) => e.stopPropagation()}>
            <Image src={storagePublicUrl("stories", images[open].path)} alt={alt(open)} fill sizes="900px" className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
