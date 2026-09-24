/* What we believe, and what each belief means for the client in practice. */
const principles = [
  {
    title: "Tracking before traffic.",
    body: "Spending more before you can measure is guessing with a bigger budget.",
    practice: "We fix GA4, Google Ads and Meta conversion tracking before we scale anything.",
  },
  {
    title: "The page is part of the ad.",
    body: "A great ad that lands on a generic homepage is a paid bounce.",
    practice: "Every campaign gets a landing page that keeps the ad’s promise.",
  },
  {
    title: "Optimize for revenue, not clicks.",
    body: "Cheap clicks and cheap leads are easy to buy and rarely worth it.",
    practice: "Campaigns are judged on qualified leads and sales, not CTR or cost per form fill.",
  },
  {
    title: "Honest numbers, owned by you.",
    body: "You can’t trust a report you can’t check.",
    practice: "Your accounts stay yours, and reports show what worked and what didn’t.",
  },
];

export function Principles() {
  return (
    <section aria-labelledby="principles-title" className="bg-soft py-24 lg:py-32">
      <div className="pm-wrap grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="pm-eyebrow">What we believe</p>
            <h2 id="principles-title" className="pm-h2 mt-5">
              Four principles behind <span className="pm-serif">every</span> account we run.
            </h2>
            <p className="pm-lede mt-5">Good tactics change every quarter. These don&rsquo;t.</p>
          </div>
        </div>

        <ol className="divide-y divide-hair border-y border-hair lg:col-span-8">
          {principles.map((p, i) => (
            <li key={p.title} className="grid gap-4 py-9 sm:grid-cols-[4rem_1fr] sm:gap-6">
              <span className="pm-serif text-[2.6rem] leading-none text-fg-3">{i + 1}</span>
              <div>
                <h3 className="text-[clamp(1.4rem,1.1rem+0.9vw,1.9rem)] font-[560] tracking-[-0.035em]">{p.title}</h3>
                <p className="mt-2 text-[16.5px] leading-relaxed text-fg-2">{p.body}</p>
                <p className="mt-5 inline-flex max-w-full items-start gap-3 rounded-[14px] bg-white px-4 py-3 text-[15px] leading-snug shadow-[0_0_0_1px_#e8e8ec]">
                  <span className="shrink-0 font-mono text-[11.5px] leading-[1.9] tracking-[0.04em] text-brand uppercase">In practice</span>
                  <span className="text-fg">{p.practice}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
