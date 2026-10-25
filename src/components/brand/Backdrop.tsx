import { Sprig } from "./Botanicals";

/** Fixed, decorative layer behind the page column. Pure CSS motion (transform only). */
export function Backdrop() {
  const sprigs = [
    { cls: "left-[-60px] top-[6%] h-[420px] text-forest-700/20", r: "-8deg", t: "19s", d: "0s", flip: false },
    { cls: "left-[4%] bottom-[-80px] h-[360px] text-leaf-500/30", r: "14deg", t: "23s", d: "-6s", flip: false },
    { cls: "right-[-70px] top-[22%] h-[460px] text-forest-700/20", r: "10deg", t: "21s", d: "-3s", flip: true },
    { cls: "right-[6%] bottom-[-40px] h-[320px] text-leaf-500/30", r: "-16deg", t: "25s", d: "-9s", flip: true },
  ];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-leaf-300/35 blur-[110px]" />
      <div className="absolute -bottom-52 left-[10%] h-[520px] w-[520px] rounded-full bg-sand/70 blur-[120px]" />
      {sprigs.map((s, i) => (
        <div
          key={i}
          className={`drift absolute hidden lg:block ${s.cls}`}
          style={{ ["--r" as string]: s.r, ["--t" as string]: s.t, ["--d" as string]: s.d }}
        >
          <Sprig className="h-full w-auto" style={s.flip ? { transform: "scaleX(-1)" } : undefined} />
        </div>
      ))}
      {/* mobile: two soft leaves peeking in so small screens aren't bare */}
      <Sprig className="drift absolute -left-10 top-[30%] h-64 text-forest-700/15 lg:hidden" />
      <Sprig className="drift absolute -right-12 top-[62%] h-72 -scale-x-100 text-leaf-500/25 lg:hidden" />
    </div>
  );
}
