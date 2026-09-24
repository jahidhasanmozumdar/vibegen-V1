import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { LOGO_ARC, LOGO_ARC_STOPS, LOGO_LENS, LOGO_LENS_STOPS } from "@/components/brand/logo-mark";

export const alt = "VibeGen — Turn paid traffic into measurable growth.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FG = "#0a0d14";
const FG2 = "#4b5263";
const HAIR = "#e8e8ec";
const BRAND = "#0a6cff";

/** Sora SemiBold (SIL OFL) is vendored so the image renders without a network fetch; it's the closest local match to Geist's bold display cut. */
const soraSemiBold = readFile(join(process.cwd(), "assets/fonts/Sora-SemiBold.ttf"));

type Pt = [number, number];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

/** A quiet silk ribbon: hairline curves interpolated between two crossing edges (same idea as components/art/ribbon). */
function ribbonPaths(lines = 30) {
  const a: Pt[] = [
    [520, 700],
    [760, 420],
    [980, 620],
    [1260, 120],
  ];
  const b: Pt[] = [
    [620, 720],
    [860, 700],
    [1000, 260],
    [1260, 300],
  ];
  const from = [10, 108, 255];
  const to = [122, 62, 255];
  return Array.from({ length: lines }, (_, i) => {
    const t = i / (lines - 1);
    const c = a.map((p, k) => mix(p, b[k], t));
    const rgb = from.map((v, k) => Math.round(lerp(v, to[k], t)));
    return {
      d: `M${c[0].join(" ")} C${c[1].join(" ")} ${c[2].join(" ")} ${c[3].join(" ")}`,
      stroke: `rgb(${rgb.join(",")})`,
      opacity: 0.18 + Math.sin(t * Math.PI) * 0.32,
    };
  });
}

/** Default share image in the "Premium Calm" look: white canvas, bold headline with one brand-blue phrase, a faint ribbon of lines. */
export default async function OpengraphImage() {
  const sora = await soraSemiBold;
  const paths = ribbonPaths();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px 56px",
          background: "#ffffff",
          color: FG,
          position: "relative",
        }}
      >
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
          {paths.map((p, i) => (
            <path key={i} d={p.d} stroke={p.stroke} strokeOpacity={p.opacity} strokeWidth="1.4" fill="none" />
          ))}
        </svg>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="78" height="44" viewBox="0 0 64 36">
            <defs>
              <linearGradient id="arc" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={LOGO_ARC_STOPS[0]} />
                <stop offset="0.45" stopColor={LOGO_ARC_STOPS[1]} />
                <stop offset="1" stopColor={LOGO_ARC_STOPS[2]} />
              </linearGradient>
              <linearGradient id="lens" x1="20" y1="18" x2="44" y2="31" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={LOGO_LENS_STOPS[0]} />
                <stop offset="1" stopColor={LOGO_LENS_STOPS[1]} />
              </linearGradient>
            </defs>
            <path d={LOGO_ARC} stroke="url(#arc)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d={LOGO_LENS} stroke="url(#lens)" strokeWidth="3.8" strokeLinejoin="round" fill="none" />
          </svg>
          <div style={{ display: "flex", fontFamily: "Sora", fontSize: 32, letterSpacing: -0.8 }}>VibeGen</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Sora", fontSize: 88, lineHeight: 1.04, letterSpacing: -4, maxWidth: 900 }}>Turn paid traffic into</div>
          <div style={{ display: "flex", fontFamily: "Sora", fontSize: 88, lineHeight: 1.04, letterSpacing: -4 }}>
            <span style={{ color: BRAND }}>measurable</span>
            <span style={{ marginLeft: 24 }}>growth.</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${HAIR}`, paddingTop: 24, fontSize: 22, color: FG2 }}>
          <span>Meta Ads · Google Ads · Landing pages · CRO · Tracking</span>
          <span style={{ display: "flex", background: FG, color: "#ffffff", borderRadius: 999, padding: "10px 22px", fontSize: 20 }}>Free growth audit</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Sora", data: sora, style: "normal", weight: 600 }],
    },
  );
}
