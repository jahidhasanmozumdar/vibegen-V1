import { ArrowRight, Check } from "lucide-react";

import { SectionHead } from "@/components/home/section-head";
import { FooterCta } from "@/components/sections/cta-bands";
import { FixLedger, Section } from "@/components/sections/primitives";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { cta } from "@/lib/config/site";
import { processStages, type ProcessStage } from "@/lib/content/process";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Our Process",
  description:
    "How VibeGen works: Discover, Audit, Build, Launch, Optimize, Scale. What happens at each stage, what we do, what you provide and what you get.",
  path: "/process",
});

/** Why the order matters: problem → real cause → our fix. */
const orderLogic = [
  {
    problem: "Budget goes up, but leads don't follow.",
    cause: "Scaling started before anyone checked that conversions were counted correctly.",
    fix: "Tracking is fixed in the Build stage, before a single campaign is launched or scaled.",
  },
  {
    problem: "Campaigns that look busy but don't sell.",
    cause: "The ads were built before anyone understood the offer, the margins or the sales process.",
    fix: "Discover comes first: we learn how you make money before we touch the ad accounts.",
  },
  {
    problem: "Every month feels like starting over.",
    cause: "Changes are made on gut feel, with no record of what was tested or why.",
    fix: "In Optimize, every change goes in an optimization log with its reason, and regular reports show what it did.",
  },
];

function Column({ title, items, highlight }: { title: string; items: string[]; highlight?: boolean }) {
  return (
    <div className={highlight ? "rounded-[18px] bg-fg p-6 text-white" : "p-6"}>
      <h4 className={highlight ? "font-mono text-[11.5px] tracking-wide text-[#7fb2ff] uppercase" : "pm-eyebrow"}>{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className={`flex items-start gap-2.5 text-[14.5px] leading-snug ${highlight ? "text-white/90" : "text-fg-2"}`}>
            {highlight ? (
              <Check className="mt-0.5 size-4 shrink-0 text-[#7fb2ff]" strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <span aria-hidden="true" className="mt-[8px] size-1.5 shrink-0 rounded-full bg-[#c3c6ce]" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StageCard({ stage, index }: { stage: ProcessStage; index: number }) {
  return (
    <article id={stage.slug} aria-labelledby={`${stage.slug}-title`} className="scroll-mt-24 rounded-[28px] border border-hair bg-white p-2">
      <div className="grid gap-2 lg:grid-cols-[0.9fr_1.6fr]">
        <div className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-fg text-[15px] font-medium text-white">
              {index + 1}
            </span>
            <span className="rounded-full bg-soft px-3 py-1 text-[12.5px] text-fg-2">{stage.timing}</span>
          </div>
          <h3 id={`${stage.slug}-title`} className="mt-7 text-[26px] font-semibold tracking-[-0.03em]">
            <span className="sr-only">Stage {index + 1}: </span>
            {stage.name}
          </h3>
          <p className="mt-2 text-[16px] leading-snug font-medium">{stage.summary}</p>
          <p className="mt-4 text-[15px] leading-relaxed text-fg-2">{stage.whatHappens}</p>
        </div>
        <div className="grid gap-2 rounded-[22px] bg-soft p-2 sm:grid-cols-3">
          <Column title="What we do" items={stage.weDo} />
          <Column title="What you provide" items={stage.youProvide} />
          <Column title="What you get" items={stage.deliverables} highlight />
        </div>
      </div>
    </article>
  );
}

export default function ProcessPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Process", path: "/process" }]}
        eyebrow="Six stages · Discover to Scale"
        title="Six stages, in order. Measurement comes before scale."
        accent="before scale."
        lead="Most wasted ad spend comes from skipping steps: scaling before tracking works, or building campaigns before understanding the offer. Here's exactly how an engagement runs, and what we need from you at each stage."
        aside={
          <nav aria-labelledby="stages-nav" className="rounded-[24px] bg-soft p-2">
            <div className="rounded-[18px] border border-hair bg-white p-6 shadow-[0_40px_80px_-36px_rgb(10_13_20/0.3)] sm:p-7">
              <p id="stages-nav" className="text-[14px] font-medium">
                The six stages
              </p>
              <ol className="mt-3 divide-y divide-hair">
                {processStages.map((stage, i) => (
                  <li key={stage.slug}>
                    <a href={`#${stage.slug}`} className="group flex items-center gap-4 py-3">
                      <span aria-hidden="true" className="w-5 font-mono text-[12.5px] text-fg-3">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-[16px] font-medium tracking-[-0.015em] group-hover:text-brand">{stage.name}</span>
                      <span className="text-[13px] text-fg-3">{stage.timing}</span>
                    </a>
                  </li>
                ))}
              </ol>
              <p className="mt-3 border-t border-hair pt-4 text-[13px] leading-relaxed text-fg-3">Timings are typical, not promises. They depend mostly on how quickly we get access.</p>
            </div>
          </nav>
        }
      >
        <ButtonLink href={cta.primary.href} size="lg" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
          {cta.primary.label}
        </ButtonLink>
        <ButtonLink href={cta.secondary.href} size="lg" variant="outline">
          {cta.secondary.label}
        </ButtonLink>
      </PageHero>

      <Section id="why" labelledBy="why-title">
        <SectionHead
          id="why-title"
          eyebrow="Why the order matters"
          title={
            <>
              Skipped steps are where <span className="pm-serif">budget leaks.</span>
            </>
          }
          lede="Each stage exists because of a problem we see again and again. Here's the problem, the real cause, and what the process does about it."
        />
        <FixLedger rows={orderLogic} className="mt-12" />
      </Section>

      <Section id="stages" labelledBy="stages-title" tone="soft">
        <SectionHead
          id="stages-title"
          eyebrow="How an engagement runs"
          title={
            <>
              Every stage has a clear <span className="pm-serif">output.</span>
            </>
          }
          lede="Setup usually takes two to three weeks. Scaling only starts when the numbers support it."
        />
        <ol className="mt-12 space-y-4">
          {processStages.map((stage, i) => (
            <li key={stage.slug}>
              <StageCard stage={stage} index={i} />
            </li>
          ))}
        </ol>
      </Section>

      <FooterCta />
    </>
  );
}
