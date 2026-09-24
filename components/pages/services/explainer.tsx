import { ArrowRight, Check, FlaskConical, Image as ImageIcon, X } from "lucide-react";
import type { ReactNode } from "react";

import { SectionHead } from "@/components/home/section-head";
import { serviceScope } from "@/lib/content/pricing";
import type { ServiceSlug } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

import { Section } from "./shared";

/*
 * The service-specific "how it actually works" section on /services/[slug].
 * Each one explains the mechanism, with the part we do highlighted.
 */

function Chain({ steps }: { steps: { step: string; title: string; body: string; ours?: boolean }[] }) {
  return (
    <ol className={cn("mt-14 grid gap-4", steps.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3")}>
      {steps.map((s, i) => (
        <li key={s.step} className={cn("relative rounded-[24px] p-7", s.ours ? "bg-fg text-white" : "bg-soft")}>
          <div className="flex items-center justify-between">
            <span className={cn("grid size-9 place-items-center rounded-full text-[14px] font-medium", s.ours ? "bg-white text-fg" : "bg-fg text-white")}>{i + 1}</span>
            <span className={cn("font-mono text-[11px] tracking-wide uppercase", s.ours ? "text-[#7fb2ff]" : "text-fg-3")}>{s.step}</span>
          </div>
          <h3 className="mt-7 text-[19px] font-semibold tracking-[-0.025em]">{s.title}</h3>
          <p className={cn("mt-2.5 text-[15px] leading-relaxed", s.ours ? "text-white/70" : "text-fg-2")}>{s.body}</p>
          {i < steps.length - 1 ? (
            <ArrowRight className="absolute top-1/2 -right-3.5 z-10 hidden size-7 -translate-y-1/2 rounded-full border border-hair bg-white p-1.5 text-fg-3 lg:block" aria-hidden="true" />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function LandingPages() {
  const matchPoints = [
    { name: "Intent", body: "The page answers the need that caused the click, not a general introduction to your business." },
    { name: "Offer", body: "The same offer, price or incentive the ad mentioned is visible without scrolling." },
    { name: "Message", body: "The headline echoes the ad's words, so visitors know within seconds they're in the right place." },
    { name: "Audience", body: "The page speaks to the people the ad targeted, not everyone who might ever visit your site." },
    { name: "CTA", body: "One clear next step, and it's the same one the ad pointed to." },
    { name: "Tracking", body: "The conversion is recorded and sent back to the platform that paid for the click." },
  ];
  return (
    <Section id="explainer-title" tone="line">
      <SectionHead
        id="explainer-title"
        eyebrow="Message match"
        title={
          <>
            Every click makes a promise. <span className="pm-serif">The page keeps it.</span>
          </>
        }
        lede="Ad → landing page → conversion. When one link in that chain breaks, you pay for the click and lose the visitor."
      />
      <Chain
        steps={[
          { step: "The ad", title: "Makes a promise", body: "A specific offer to a specific audience, with one reason to click." },
          { step: "The page", title: "Keeps it", body: "Same words, same offer, same next step. Nothing to hunt for.", ours: true },
          { step: "Conversion", title: "Gets recorded", body: "The lead or sale is tracked and reported back to the ad platform.", ours: true },
        ]}
      />
      <h3 className="mt-16 text-[17px] font-semibold tracking-[-0.02em]">The six things that have to match</h3>
      <ol className="mt-5 grid gap-x-10 gap-y-0 border-t border-hair sm:grid-cols-2 lg:grid-cols-3">
        {matchPoints.map((p, i) => (
          <li key={p.name} className="border-b border-hair py-5">
            <p className="flex items-baseline gap-3">
              <span className="font-mono text-[12px] text-fg-3">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[16px] font-semibold tracking-[-0.015em]">{p.name}</span>
            </p>
            <p className="mt-1.5 pl-8 text-[14.5px] leading-relaxed text-fg-2">{p.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-[14px] text-fg-3">Campaign landing pages, not unlimited full websites. The number of pages per month depends on your plan.</p>
    </Section>
  );
}

function Cro() {
  const myths = ["Changing button colours", "Running tests without a hypothesis", "Redesigning the whole site", "Copying a competitor's page"];
  const reality = [
    { name: "Offer clarity", body: "Can a visitor tell what you're offering and why it's worth it in five seconds?" },
    { name: "Message match", body: "Does the page continue the conversation the ad started?" },
    { name: "Friction", body: "How much effort does the form, checkout or booking step ask for?" },
    { name: "Trust", body: "Is there enough real proof for someone to hand over their details?" },
    { name: "Traffic quality", body: "Are the campaigns sending people who could ever convert?" },
  ];
  return (
    <Section id="explainer-title" tone="line">
      <SectionHead
        id="explainer-title"
        eyebrow="What CRO actually is"
        title={
          <>
            CRO isn&rsquo;t changing <span className="pm-serif">button colours.</span>
          </>
        }
        lede="Most conversion problems sit in the offer, the message, the friction and the trust on the page, and sometimes in the traffic itself."
      />
      <div className="mt-14 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[24px] bg-soft p-8">
          <h3 className="text-[17px] font-semibold tracking-[-0.02em]">What it gets mistaken for</h3>
          <ul className="mt-5 space-y-3">
            {myths.map((m) => (
              <li key={m} className="flex items-start gap-3 text-[15px] text-fg-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#fdecea] text-[#b42318]">
                  <X className="size-3" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span>
                  <span className="sr-only">Myth: </span>
                  <span className="line-through">{m}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[24px] bg-fg p-8 text-white">
          <h3 className="text-[17px] font-semibold tracking-[-0.02em]">What we actually work on</h3>
          <ul className="mt-5 space-y-3.5">
            {reality.map((r) => (
              <li key={r.name} className="flex items-start gap-3 text-[15px]">
                <Check className="mt-0.5 size-4.5 shrink-0 text-[#7fb2ff]" strokeWidth={2.5} aria-hidden="true" />
                <span>
                  <span className="font-medium">{r.name}.</span> <span className="text-white/70">{r.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-4 rounded-[20px] border border-hair p-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-brand-soft text-brand">
          <FlaskConical className="size-5" aria-hidden="true" />
        </span>
        <p className="text-[15px] leading-relaxed text-fg-2">
          <span className="font-medium text-fg">Testing depends on traffic.</span> A reliable A/B test needs enough traffic and conversions to reach a clear answer, so we don&rsquo;t
          promise a fixed number of tests. On lower-traffic pages we make research-led changes and compare before and after, and we&rsquo;re clear about the limits of that.
        </p>
      </div>
    </Section>
  );
}

function Analytics() {
  const questions = [
    { q: "Where did users come from?", how: "Consistent UTMs and source data saved with every lead." },
    { q: "What did they do?", how: "GA4 events for the actions that matter, named the same way everywhere." },
    { q: "Where did they drop off?", how: "Funnel reports from first visit to form, call or checkout." },
    { q: "Which campaigns generate leads?", how: "Clean conversion tracking in Google Ads and Meta, checked against GA4." },
    { q: "Which leads become customers?", how: "CRM and offline conversions sent back to the platforms, where technically feasible." },
  ];
  return (
    <Section id="explainer-title" tone="line">
      <SectionHead
        id="explainer-title"
        eyebrow="Know what is actually working"
        title={
          <>
            Five questions your tracking should <span className="pm-serif">answer.</span>
          </>
        }
        lede="If you can't answer these with confidence, every budget decision is partly a guess."
      />
      <div className="mt-14 overflow-hidden rounded-[24px] border border-hair">
        <div className="hidden grid-cols-[1fr_1.3fr] border-b border-hair bg-[#fbfbfa] md:grid">
          <p className="pm-eyebrow px-7 py-4">The question</p>
          <p className="border-l border-fg bg-fg px-7 py-4 font-mono text-[0.76rem] font-medium tracking-[0.04em] text-[#7fb2ff] uppercase">How we answer it</p>
        </div>
        <ol className="divide-y divide-hair">
          {questions.map((item, i) => (
            <li key={item.q} className="grid md:grid-cols-[1fr_1.3fr]">
              <p className="flex items-baseline gap-3 px-6 py-5 text-[16.5px] font-medium tracking-[-0.015em] md:px-7">
                <span className="font-mono text-[12px] text-fg-3">{String(i + 1).padStart(2, "0")}</span>
                {item.q}
              </p>
              <p className="bg-fg px-6 py-5 text-[15px] leading-relaxed text-white/80 md:px-7">
                <span className="sr-only">How we answer it: </span>
                {item.how}
              </p>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-6 text-[14px] text-fg-3">How far we can take it depends on your tools and business model. The audit tells you what&rsquo;s realistic before any work starts.</p>
    </Section>
  );
}

function GoogleAds() {
  return (
    <Section id="explainer-title" tone="line">
      <SectionHead
        id="explainer-title"
        eyebrow="Built around intent"
        title={
          <>
            From the search to the page, every step should <span className="pm-serif">match.</span>
          </>
        }
        lede="Search campaigns work when the keyword, the ad and the landing page all answer the question the searcher asked. An example for illustration:"
      />
      <Chain
        steps={[
          { step: "Intent", title: "“emergency plumber near me”", body: "Urgent, local and ready to call. Not researching, not comparing for next month." },
          { step: "Keyword", title: "Emergency repairs", body: "A tight ad group for urgent terms, with negatives like “jobs”, “course” and “diy”.", ours: true },
          { step: "Ad", title: "Speaks to the urgency", body: "Same-day callouts, the area covered and a call option, not a generic brand message.", ours: true },
          { step: "Page", title: "Phone number first", body: "Service area, response time, real reviews and a short form for people who can't call.", ours: true },
        ]}
      />
    </Section>
  );
}

function MetaAds() {
  const rows = [
    {
      label: "Who it reaches",
      p: "People who haven't heard of you yet but fit your customer profile: broad, interest-based and lookalike audiences.",
      r: "Site visitors, video viewers and leads who haven't taken the next step.",
    },
    { label: "Its job", p: "Introduce the offer and earn a first click or a low-commitment first step.", r: "Follow up with proof, answer objections and bring people back to finish." },
    { label: "What we watch", p: "Cost per lead or purchase from new audiences, not reach or likes.", r: "Frequency and overlap, so the same people aren't paid for twice." },
  ];
  return (
    <Section id="explainer-title" tone="line">
      <SectionHead
        id="explainer-title"
        eyebrow="How the campaigns fit"
        title={
          <>
            Prospecting finds people. Retargeting <span className="pm-serif">follows up.</span>
          </>
        }
        lede="Both are sized and sequenced so budget goes to new demand first and follow-up doesn't cannibalise it."
      />
      <div className="mt-14 overflow-x-auto rounded-[24px] border border-hair">
        <table className="w-full min-w-[40rem] text-left text-[15px]">
          <caption className="sr-only">Prospecting and retargeting compared</caption>
          <thead>
            <tr className="border-b border-hair bg-[#fbfbfa]">
              <td aria-hidden="true" className="w-[22%]" />
              <th scope="col" className="pm-eyebrow px-6 py-4 font-medium">
                Prospecting
              </th>
              <th scope="col" className="pm-eyebrow border-l border-hair px-6 py-4 font-medium">
                Retargeting
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hair">
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="px-6 py-5 align-top text-[15px] font-semibold tracking-[-0.015em]">
                  {row.label}
                </th>
                <td className="px-6 py-5 align-top leading-relaxed text-fg-2">{row.p}</td>
                <td className="border-l border-hair px-6 py-5 align-top leading-relaxed text-fg-2">{row.r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] bg-soft p-8">
          <h3 className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
            <ImageIcon className="size-4.5 text-fg-3" aria-hidden="true" />
            Assets you provide
          </h3>
          <ul className="mt-5 flex flex-wrap gap-2">
            {serviceScope.clientProvides.map((a) => (
              <li key={a} className="rounded-full bg-white px-3 py-1.5 text-[14px] text-fg-2">
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[24px] bg-fg p-8 text-white">
          <h3 className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
            <FlaskConical className="size-4.5 text-[#7fb2ff]" aria-hidden="true" />
            What we do with them
          </h3>
          <p className="mt-4 text-[15px] leading-relaxed text-white/75">
            We write the copy and organise your assets into structured tests of different hooks, formats and angles. Creative production isn&rsquo;t part of the
            service, and we&rsquo;ll tell you plainly when better assets would make a real difference.
          </p>
        </div>
      </div>
    </Section>
  );
}

const explainers: Record<ServiceSlug, () => ReactNode> = {
  "landing-pages": LandingPages,
  cro: Cro,
  analytics: Analytics,
  "google-ads": GoogleAds,
  "meta-ads": MetaAds,
};

/** Service-specific "how it works" section. */
export function ServiceExplainer({ slug }: { slug: ServiceSlug }) {
  const Explainer = explainers[slug];
  return <Explainer />;
}
