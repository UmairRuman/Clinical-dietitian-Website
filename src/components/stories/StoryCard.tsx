import type { PublicStory } from "@/lib/types";
import { StoryImages } from "./StoryImages";
import { QuoteMark } from "@/components/brand/Botanicals";
import { Stars } from "@/components/ui/Stars";

const fmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "Asia/Karachi" });

export function StoryCard({ story }: { story: PublicStory }) {
  return (
    <figure className="card-paper relative flex h-full flex-col rounded-[26px] p-6 pt-7">
      <QuoteMark className="absolute right-5 top-5 h-6 text-leaf-300" />
      <StoryImages images={story.images} name={story.name} />
      {story.result && (
        <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-mint-100 px-3.5 py-1.5 text-[13px] font-bold tracking-wide text-forest-700">
          <span className="size-1.5 rounded-full bg-clay" />
          {story.result}
        </p>
      )}
      {story.rating && (
        <div className="mb-3">
          <Stars value={story.rating} />
        </div>
      )}
      <blockquote dir="auto" className="flex-1 text-[16px] leading-[1.7] text-forest-900/90">
        {story.text}
      </blockquote>
      <figcaption className="mt-5 flex items-center justify-between border-t border-dashed border-leaf-400/50 pt-4">
        <span className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-leaf-300 font-display text-[15px] font-semibold text-forest-900">
            {story.name.charAt(0)}
          </span>
          <span className="font-semibold">{story.name}</span>
        </span>
        <time dateTime={story.date} className="text-sm text-ink-soft">
          {fmt.format(new Date(story.date))}
        </time>
      </figcaption>
    </figure>
  );
}
