/*
 * The diagnosis, set as a ledger: symptom → real cause → our fix.
 * The fix column is the dark, highlighted one: the solution is what you read first.
 */
const rows = [
  {
    see: "You pay for clicks, but the enquiries don’t come.",
    why: "The page doesn’t match the ad, so visitors don’t see why they should act.",
    fix: "We rebuild the landing page around the ad’s promise and make the next step obvious.",
  },
  {
    see: "Google says 40 conversions. Your team counted 12.",
    why: "Duplicate tags and page views counted as leads. The platforms learn the wrong thing.",
    fix: "We fix tracking so each lead is counted once and traced to the campaign that brought it.",
  },
  {
    see: "Leads look cheap, but sales says most are a waste of time.",
    why: "Campaigns are told to find the cheapest form fill, so that’s what they find.",
    fix: "We optimize for qualified leads and cut the searches and audiences that never buy.",
  },
  {
    see: "Budgets change on gut feel and last week’s numbers.",
    why: "Nobody trusts the data enough to decide with it.",
    fix: "Clear, regular reports: spend, leads, cost per lead, and what we’ll change next.",
  },
];

export function Problems() {
  return (
    <section aria-labelledby="problems-title" className="py-24 lg:py-32">
      <div className="pm-wrap">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="pm-eyebrow">The diagnosis</p>
            <h2 id="problems-title" className="pm-h2 mt-5">
              Every symptom has a cause. <span className="pm-serif text-brand">Fix the cause.</span>
            </h2>
          </div>
          <p className="pm-lede lg:col-span-5">Most agencies treat the symptom: more budget, new ads. We trace it back to where the money actually leaks.</p>
        </div>

        <div className="mt-14">
          {/* column heads (desktop) */}
          <div className="hidden grid-cols-[1fr_1fr_1.15fr] gap-4 px-2 pb-3 lg:grid">
            <p className="pm-eyebrow">What you see</p>
            <p className="pm-eyebrow">Why it happens</p>
            <p className="pm-eyebrow text-brand">What we do</p>
          </div>
          <ol className="space-y-3">
            {rows.map((r, i) => (
              <li key={r.see} className="grid gap-4 rounded-[22px] border border-hair p-3 lg:grid-cols-[1fr_1fr_1.15fr] lg:items-stretch">
                <div className="p-3 lg:p-4">
                  <p className="pm-eyebrow lg:hidden">What you see</p>
                  <p className="mt-2 flex gap-3 text-[17.5px] leading-snug font-medium tracking-[-0.02em] lg:mt-0">
                    <span className="font-mono text-[12px] leading-[1.9] text-fg-3">0{i + 1}</span>
                    {r.see}
                  </p>
                </div>
                <div className="p-3 lg:border-l lg:border-hair lg:p-4">
                  <p className="pm-eyebrow lg:hidden">Why it happens</p>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-fg-2 lg:mt-0">{r.why}</p>
                </div>
                <div className="rounded-[16px] bg-fg p-5 text-white">
                  <p className="font-mono text-[11.5px] tracking-[0.04em] text-[#7fb2ff] uppercase lg:hidden">What we do</p>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-white/90 lg:mt-0">{r.fix}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
