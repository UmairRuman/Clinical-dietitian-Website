"use client";

import { useState } from "react";
import Link from "next/link";
import type { PublicStory } from "@/lib/types";
import { StoryCard } from "./StoryCard";
import { cn } from "@/lib/utils";

const PAGE = 6;

export function StoriesBrowser({ stories }: { stories: PublicStory[] }) {
  const [tab, setTab] = useState<"review" | "story">("story");
  const [shown, setShown] = useState(PAGE);
  const list = stories.filter((s) => s.type === tab);

  return (
    <div>
      <div role="tablist" aria-label="Type" className="mx-auto flex w-full max-w-[360px] rounded-full bg-mint-200/70 p-1.5">
        {([["story", "Success Stories"], ["review", "Reviews"]] as const).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => { setTab(k); setShown(PAGE); }}
            className={cn(
              "min-h-11 flex-1 rounded-full px-4 text-[15px] font-semibold transition duration-300",
              tab === k ? "bg-paper text-forest-900 shadow-[0_6px_14px_-8px_rgba(36,85,58,0.7)]" : "text-forest-700 hover:text-forest-900",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.slice(0, shown).map((s) => (
          <li key={s.id}>
            <StoryCard story={s} />
          </li>
        ))}
        {list.length === 0 && (
          <li className="card-paper rounded-3xl p-8 md:col-span-2 lg:col-span-3 text-center text-ink-soft">No {tab === "story" ? "stories" : "reviews"} yet. Be the first to share.</li>
        )}
      </ul>

      {shown < list.length && (
        <button onClick={() => setShown((n) => n + PAGE)} className="mx-auto mt-6 block rounded-full border border-forest-700/30 px-7 py-3 font-semibold text-forest-700 hover:bg-mint-100">
          Load more
        </button>
      )}

      <div className="mt-10 text-center">
        <Link href="/stories/submit" className="cta-surface inline-flex min-h-14 items-center rounded-full px-8 text-[15px] font-bold uppercase tracking-[0.08em] text-forest-900">
          Share your story / review
        </Link>
        <p className="mx-auto mt-4 max-w-[38ch] text-[13px] leading-relaxed text-ink-soft">Results vary from person to person and are not a guarantee.</p>
      </div>
    </div>
  );
}
