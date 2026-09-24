import { SiteScanner } from "./site-scanner";

const platforms = ["Meta Ads", "Google Ads", "GA4", "Google Tag Manager", "Meta Pixel + CAPI", "Looker Studio"];

/** The live Instant Funnel Scan as its own band (anchor: #scan). */
export function ScanStrip() {
  return (
    <section id="scan" aria-labelledby="scan-title" className="scroll-mt-20 bg-soft py-14 lg:py-20">
      <div className="pm-wrap">
        <div className="mb-7">
          <p className="pm-eyebrow">Don&rsquo;t take our word for it</p>
          <h2 id="scan-title" className="mt-3 text-[clamp(1.6rem,1rem+1.6vw,2.3rem)] font-[560] tracking-[-0.035em]">
            Test <span className="pm-serif">your own</span> site, free.
          </h2>
        </div>
        <SiteScanner />
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-[13px] text-fg-3">Built on the platforms you already run</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-9 gap-y-3">
            {platforms.map((p) => (
              <li key={p} className="text-[16px] font-semibold tracking-[-0.03em] text-[#a0a5b0]">
                {p}
              </li>
            ))}
          </ul>
          <p className="text-[11.5px] text-fg-3">Platform names used descriptively. No partnership implied.</p>
        </div>
      </div>
    </section>
  );
}
