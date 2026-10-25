import type { CSSProperties } from "react";

const r2 = (n: number) => Math.round(n * 100) / 100;

// A single pointed leaf lying along +x, 20 units long
const LEAF = "M0 0 C3 -6.5 12 -8.5 20 -1.5 C12 5 3 5.5 0 0Z";
const LEAF_VEIN = "M1.5 -0.3 L15 -1.4";

function bezier(t: number, p: number[][]) {
  const u = 1 - t;
  const x = u ** 3 * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t ** 3 * p[3][0];
  const y = u ** 3 * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t ** 3 * p[3][1];
  const dx = 3 * u * u * (p[1][0] - p[0][0]) + 6 * u * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]);
  const dy = 3 * u * u * (p[1][1] - p[0][1]) + 6 * u * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1]);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

/** Pressed-herb style sprig: curved stem with alternating leaves. Decorative. */
export function Sprig({
  className,
  style,
  leaves = 9,
  stroke = "currentColor",
}: {
  className?: string;
  style?: CSSProperties;
  leaves?: number;
  stroke?: string;
}) {
  const p = [
    [12, 196],
    [34, 128],
    [58, 70],
    [112, 8],
  ];
  const items = Array.from({ length: leaves }, (_, i) => {
    const t = 0.12 + (i / (leaves - 1)) * 0.86;
    const { x, y, angle } = bezier(t, p);
    const side = i % 2 === 0 ? -1 : 1;
    const scale = 1.55 - t * 0.75;
    return { x: r2(x), y: r2(y), rot: r2(angle + side * 48), scale: r2(scale) };
  });
  const tip = bezier(1, p);
  return (
    <svg viewBox="0 0 150 200" fill="none" className={className} style={style} aria-hidden>
      <path d={`M${p[0]} C${p[1]} ${p[2]} ${p[3]}`.replace(/(\d),(\d)/g, "$1 $2")} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      {items.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.scale})`}>
          <path d={LEAF} fill={stroke} fillOpacity=".16" stroke={stroke} strokeWidth="0.9" strokeLinejoin="round" />
          <path d={LEAF_VEIN} stroke={stroke} strokeWidth="0.6" strokeLinecap="round" />
        </g>
      ))}
      <g transform={`translate(${r2(tip.x)} ${r2(tip.y)}) rotate(${r2(tip.angle)}) scale(1.1)`}>
        <path d={LEAF} fill={stroke} fillOpacity=".16" stroke={stroke} strokeWidth="0.9" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** Laurel-style wreath that frames the profile portrait. Draws itself in on load (CSS). */
export function Wreath({ className }: { className?: string }) {
  const cx = 120;
  const cy = 120;
  const radius = 106;
  const perSide = 11;
  const sweep = 166;
  const leaves: { x: number; y: number; rot: number; s: number; d: number; inner: boolean }[] = [];
  const stems: string[] = [];

  for (const side of [-1, 1]) {
    let path = "";
    for (let i = 0; i <= 40; i++) {
      const phi = ((i / 40) * sweep * Math.PI) / 180;
      const x = cx + side * radius * Math.sin(phi);
      const y = cy + radius * Math.cos(phi);
      path += `${i === 0 ? "M" : "L"}${r2(x)} ${r2(y)} `;
    }
    stems.push(path.trim());
    for (let i = 0; i < perSide; i++) {
      const t = 0.04 + (i / (perSide - 1)) * 0.94;
      const phi = (t * sweep * Math.PI) / 180;
      const x = cx + side * radius * Math.sin(phi);
      const y = cy + radius * Math.cos(phi);
      const tangent = (Math.atan2(-Math.sin(phi), side * Math.cos(phi)) * 180) / Math.PI;
      const inner = i % 2 === 1;
      // slight irregularity so it reads hand-drawn, not generated
      const wobble = ((i * 37 + (side > 0 ? 11 : 0)) % 9) - 4;
      leaves.push({
        x: r2(x),
        y: r2(y),
        rot: r2(tangent + (inner ? 140 : 40) * (side > 0 ? 1 : -1) * -1 + wobble),
        s: r2((1.25 - Math.abs(t - 0.45) * 0.55) * (inner ? 0.85 : 1.05)),
        d: Math.round(500 + t * 900 + (side > 0 ? 120 : 0)),
        inner,
      });
    }
  }

  return (
    <svg viewBox="0 0 240 240" fill="none" className={className} aria-hidden>
      {stems.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="var(--forest-700)"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="draw"
          style={{ ["--len" as string]: 360, ["--d" as string]: "250ms" }}
        />
      ))}
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.s})`}>
          <g className="pop" style={{ ["--d" as string]: `${l.d}ms`, transformBox: "fill-box", transformOrigin: "0% 50%" }}>
            <path
              d={LEAF}
              fill={l.inner ? "var(--leaf-400)" : "var(--leaf-300)"}
              stroke="var(--forest-700)"
              strokeWidth="0.9"
              strokeLinejoin="round"
            />
            <path d={LEAF_VEIN} stroke="var(--forest-700)" strokeWidth="0.55" strokeLinecap="round" opacity=".7" />
          </g>
        </g>
      ))}
    </svg>
  );
}

/** Small vine used instead of <hr> */
export function VineDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 20" fill="none" className={className} aria-hidden>
      <path d="M4 10 H78" stroke="var(--leaf-500)" strokeWidth="1.2" strokeLinecap="round" opacity=".6" />
      <path d="M122 10 H196" stroke="var(--leaf-500)" strokeWidth="1.2" strokeLinecap="round" opacity=".6" />
      <path d="M86 11 C92 4 98 4 100 10 C102 16 108 16 114 9" stroke="var(--forest-700)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M100 10 C96 2 90 1 86 3 C90 9 95 11 100 10Z" fill="var(--leaf-300)" stroke="var(--forest-700)" strokeWidth="1" strokeLinejoin="round" />
      <path d="M100 10 C106 18 112 19 116 17 C112 11 106 9 100 10Z" fill="var(--leaf-300)" stroke="var(--forest-700)" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/** Quote ornament for story cards */
export function QuoteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 36" className={className} aria-hidden>
      <path
        d="M0 36V20C0 8 6 1.5 18 0v7c-6 1.2-8.5 4.4-8.7 9H18v20H0Zm27 0V20C27 8 33 1.5 45 0v7c-6 1.2-8.5 4.4-8.7 9H45v20H27Z"
        fill="currentColor"
      />
    </svg>
  );
}
