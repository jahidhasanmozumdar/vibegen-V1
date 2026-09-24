/*
 * Silk ribbon — VibeGen's signature art. Dozens of hairline curves are
 * interpolated between two edge curves that cross over, so the bundle twists
 * like fabric. Deterministic, server-rendered SVG; no images, no JS.
 */

type Pt = [number, number];
type Curve = [Pt, Pt, Pt, Pt];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function colorAt(stops: string[], t: number) {
  const x = t * (stops.length - 1);
  const i = Math.min(Math.floor(x), stops.length - 2);
  const f = x - i;
  const a = hex(stops[i]);
  const b = hex(stops[i + 1]);
  return `rgb(${Math.round(lerp(a[0], b[0], f))} ${Math.round(lerp(a[1], b[1], f))} ${Math.round(lerp(a[2], b[2], f))})`;
}

export const ribbonPresets = {
  hero: {
    viewBox: "0 0 1440 900",
    a: [
      [1520, -120],
      [980, 180],
      [1380, 560],
      [760, 980],
    ] as Curve,
    b: [
      [1660, -40],
      [1260, 620],
      [860, 240],
      [1010, 1040],
    ] as Curve,
  },
  band: {
    viewBox: "0 0 1440 600",
    a: [
      [-80, 520],
      [420, 260],
      [900, 640],
      [1520, 180],
    ] as Curve,
    b: [
      [-80, 380],
      [520, 620],
      [980, 180],
      [1520, 330],
    ] as Curve,
  },
};

export function Ribbon({
  preset = "hero",
  lines = 64,
  colors = ["#0a6cff", "#7a3eff", "#ff7ab6", "#02d3c9"],
  className,
  opacity = 0.9,
}: {
  preset?: keyof typeof ribbonPresets;
  lines?: number;
  colors?: string[];
  className?: string;
  opacity?: number;
}) {
  const { viewBox, a, b } = ribbonPresets[preset];
  const paths = Array.from({ length: lines }, (_, i) => {
    const t = i / (lines - 1);
    const c = a.map((p, k) => mix(p, b[k], t)) as Curve;
    return {
      d: `M${c[0].join(" ")} C${c[1].join(" ")} ${c[2].join(" ")} ${c[3].join(" ")}`,
      stroke: colorAt(colors, t),
      // edges thinner & fainter, middle fuller — reads as a lit fabric fold
      w: 1 + Math.sin(t * Math.PI) * 1.1,
      o: 0.35 + Math.sin(t * Math.PI) * 0.6,
    };
  });

  return (
    <svg viewBox={viewBox} className={className} aria-hidden="true" preserveAspectRatio="xMaxYMin slice" style={{ opacity }}>
      {paths.map((p, i) => (
        <path key={i} d={p.d} stroke={p.stroke} strokeWidth={p.w} strokeOpacity={p.o} fill="none" />
      ))}
    </svg>
  );
}
