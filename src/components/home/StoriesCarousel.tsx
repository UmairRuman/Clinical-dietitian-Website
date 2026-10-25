"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicStory } from "@/lib/types";
import { StoryCard } from "@/components/stories/StoryCard";
import { cn } from "@/lib/utils";

export function StoriesCarousel({ stories, wide }: { stories: PublicStory[]; wide?: boolean }) {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const card = el.children[0] as HTMLElement | undefined;
        if (!card) return;
        const step = card.offsetWidth + 16;
        setActive(Math.min(stories.length - 1, Math.round(el.scrollLeft / step)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [stories.length]);

  const goTo = (i: number) => {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 20, behavior: "smooth" });
  };

  return (
    <div>
      <ul
        ref={track}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-10 pt-1 -mb-6"
        aria-label="Client success stories"
      >
        {stories.map((s) => (
          <li key={s.id} className={cn("shrink-0 snap-center", wide ? "w-[84%] sm:w-[60%] lg:w-[calc((100%-32px)/3)]" : "w-[84%] sm:w-[78%]")}>
            <StoryCard story={s} />
          </li>
        ))}
      </ul>
      <div className="mt-1 flex justify-center gap-2" role="group" aria-label="Choose story">
        {stories.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            aria-label={`Show story ${i + 1}`}
            aria-current={i === active}
            className="grid size-6 place-items-center"
          >
            <span className={cn("h-2 rounded-full bg-forest-700 transition-all duration-300", i === active ? "w-7" : "w-2 opacity-25")} />
          </button>
        ))}
      </div>
    </div>
  );
}
