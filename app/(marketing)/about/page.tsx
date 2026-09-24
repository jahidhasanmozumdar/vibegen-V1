import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";

import { SectionHead } from "@/components/home/section-head";
import { FooterCta } from "@/components/sections/cta-bands";
import { Crosses, FixLedger, GlanceCard, Section, Ticks } from "@/components/sections/primitives";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { cta } from "@/lib/config/site";
import { processStages } from "@/lib/content/process";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "About",
  description:
    "VibeGen is a small performance marketing studio for businesses in the US and UK. We connect Meta Ads, Google Ads, landing pages, CRO and tracking into one measurable acquisition system.",
  path: "/about",
});

/** The reason the studio exists: problem → real cause → our fix. */
const whyWeExist = [
  {
    problem: "The ads look fine in the dashboard, but nobody can say which ones brought in customers.",
    cause: "Ads, landing pages and tracking are handled by different people, and nobody owns the path from click to customer.",
    fix: "One team runs the ads, the pages they point to and the tracking between them, so every change can be measured.",
  },
  {
    problem: "Cost per click keeps rising and the conversion rate isn't trusted.",
    cause: "Tracking was set up once and never checked, so budget decisions follow platform numbers that don't match sales.",
    fix: "Measurement is fixed first, and reported against what your sales team actually sees.",
  },
];

const principles: { title: string; body: string; forYou: string }[] = [
  {
    title: "Measure before scaling.",
    body: "If tracking is wrong, every decision built on it is wrong too. We fix measurement first, then spend more.",
    forYou: "No budget increases until the numbers can be trusted.",
  },
  {
    title: "The landing page is part of the ad.",
    body: "A click is a promise. If the page doesn't keep it, the ad failed, however good the click-through rate looked.",
    forYou: "Every campaign points to a page written for it.",
  },
  {
    title: "No vanity metrics.",
    body: "Impressions and clicks are inputs. We report on leads, cost per lead, pipeline and revenue wherever tracking allows.",
    forYou: "Reports lead with the numbers your business runs on.",
  },
  {
    title: "You own your accounts.",
    body: "Ad accounts, GA4, GTM, your site and your data stay in your name. We work with access you grant and can remove.",
    forYou: "If we part ways, nothing needs to be handed back.",
  },
  {
    title: "Honest about what paid traffic can't fix.",
    body: "Ads amplify what's already there. If the offer, pricing or follow-up is the problem, we'll say so rather than spend through it.",
    forYou: "You hear it early, before budget is spent on it.",
  },
];

/**
 * Founder details — edit here once confirmed.
 * TODO(content): add the founder's real name, a short factual bio and, if wanted,
 * a photo (next/image with alt text). Keep it factual: no invented years of
 * experience, client counts, past employers or results. While `name` is null the
 * section shows an initials monogram and a neutral role line.
 */
const founder: { name: string | null; initials: string; role: string } = {
  name: null,
  initials: "VG",
  role: "Founder, VibeGen — strategy, paid media and measurement",
};

const glance = [
  { term: "Markets", value: "United States & United Kingdom" },
  { term: "We run", value: "Ads, landing pages, CRO, tracking" },
  { term: "Size", value: "Small, on purpose" },
];

const weDo = ["Meta Ads", "Google Ads", "Landing pages", "Conversion rate optimization", "GA4, GTM, Pixel and conversion tracking", "Reporting and strategy calls"];
const weDont = ["Social media management", "Creative production (shoots, new brand design)", "Full website builds"];

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "About", path: "/about" }]}
        eyebrow="A small studio · US & UK"
        title="A performance studio for businesses that need ads to pay for themselves."
        accent="pay for themselves."
        lead="VibeGen builds and manages conversion-focused acquisition systems: Meta Ads, Google Ads, landing pages, CRO and the tracking that ties them together. We work with startups and growing businesses in the United States and the United Kingdom."
        aside={<GlanceCard title="VibeGen at a glance" rows={glance} footer="We're early, so there's no wall of client logos here. Case studies on this site are illustrative and labelled." />}
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
          eyebrow="Why VibeGen exists"
          title={
            <>
              Most funnels leak between the ad and the <span className="pm-serif">sale.</span>
            </>
          }
          lede="Plenty of businesses pay for traffic that never had a fair chance of converting. Here's why, and what we do about it."
        />
        <FixLedger rows={whyWeExist} className="mt-12" />
      </Section>

      <Section id="what" labelledBy="what-title" tone="soft">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
          <div>
            <SectionHead
              id="what-title"
              eyebrow="What VibeGen is"
              title={
                <>
                  One team across the ads, the pages and <span className="pm-serif">the numbers.</span>
                </>
              }
            />
            <div className="mt-6 space-y-4 text-[16.5px] leading-relaxed text-fg-2">
              <p>
                We&apos;re a deliberately small performance studio. We run Meta and Google campaigns, write and build the landing pages they point to, fix conversion
                problems on those pages, and set up the tracking that tells you whether any of it worked.
              </p>
              <p>Keeping the scope narrow is how we keep the work careful.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-[20px] bg-fg p-7 text-white">
              <h3 className="text-[17px] font-semibold tracking-[-0.02em]">What we do</h3>
              <Ticks items={weDo} tone="light" className="mt-5" />
            </div>
            <div className="pm-card p-7">
              <h3 className="text-[17px] font-semibold tracking-[-0.02em]">What we don&apos;t</h3>
              <Crosses items={weDont} className="mt-5" />
              <p className="mt-5 border-t border-hair pt-4 text-[13.5px] leading-relaxed text-fg-3">If that&apos;s what you need, we&apos;ll tell you on the first call.</p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="beliefs" labelledBy="beliefs-title">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <div className="lg:sticky lg:top-24">
              <SectionHead
                id="beliefs-title"
                eyebrow="What we believe"
                title={
                  <>
                    Five rules we hold <span className="pm-serif">ourselves to.</span>
                  </>
                }
                lede="They shape what we'll say no to, as much as what we do."
              />
            </div>
          </div>
          <ol className="divide-y divide-hair border-y border-hair">
            {principles.map((p, i) => (
              <li key={p.title} className="grid gap-4 py-7 sm:grid-cols-[3rem_1fr]">
                <span aria-hidden="true" className="font-mono text-[13px] text-fg-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[20px] font-semibold tracking-[-0.025em]">{p.title}</h3>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-fg-2">{p.body}</p>
                  <p className="mt-4 inline-flex items-start gap-2 rounded-[12px] bg-brand-soft px-3.5 py-2.5 text-[14.5px] text-fg">
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2.5} aria-hidden="true" />
                    <span>
                      <span className="font-medium">What it means for you: </span>
                      {p.forYou}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section id="how" labelledBy="how-title" tone="soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            id="how-title"
            eyebrow="How we work"
            title={
              <>
                Business model first, then measurement, <span className="pm-serif">then spend.</span>
              </>
            }
            lede="Every engagement follows the same six stages, in the same order."
          />
          <Link href="/process" className="pm-link inline-flex shrink-0 items-center gap-1.5">
            See the full process <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {processStages.map((stage, i) => (
            <li key={stage.slug}>
              <Link href={`/process#${stage.slug}`} className="group flex h-full flex-col rounded-[20px] border border-hair bg-white p-5 transition-shadow hover:shadow-[0_24px_48px_-24px_rgb(10_13_20/0.25)]">
                <span className="grid size-7 place-items-center rounded-full bg-fg text-[12.5px] font-medium text-white">{i + 1}</span>
                <span className="mt-5 text-[17px] font-semibold tracking-[-0.02em]">{stage.name}</span>
                <span className="mt-1.5 text-[14px] leading-snug text-fg-2">{stage.summary}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="founder" labelledBy="founder-title">
        <div className="grid overflow-hidden rounded-[28px] border border-hair lg:grid-cols-[0.8fr_1.4fr]">
          <div className="flex flex-col items-start gap-6 bg-soft p-8 sm:p-10">
            <p className="pm-eyebrow">Founder</p>
            <div aria-hidden="true" className="grid size-28 place-items-center rounded-[24px] bg-fg text-[2.6rem] font-semibold tracking-[-0.05em] text-white">
              {founder.initials}
            </div>
            <div>
              <h2 id="founder-title" className="text-[24px] font-semibold tracking-[-0.03em]">
                {founder.name ?? "The founder"}
              </h2>
              <p className="mt-1.5 text-[15px] text-fg-2">{founder.role}</p>
            </div>
          </div>
          <div className="space-y-5 bg-white p-8 text-[16.5px] leading-relaxed text-fg-2 sm:p-10">
            <p>
              VibeGen is a new, deliberately small studio. It was started because the same pattern kept showing up: businesses spending real money on ads, with
              campaigns, landing pages and tracking handled separately and nobody accountable for the whole funnel.
            </p>
            <p>
              The studio is built to do fewer things properly: set up measurement you can trust, match every landing page to the ad that sends traffic to it, and report
              plainly on what is and isn&apos;t working.
            </p>
            <p className="flex gap-3 rounded-[16px] bg-brand-soft p-5 text-[15px] text-fg">
              <Eye className="mt-0.5 size-4.5 shrink-0 text-brand" aria-hidden="true" />
              <span>
                We&apos;re early, so there&apos;s no wall of client logos here. The{" "}
                <Link href="/case-studies" className="pm-link">
                  case studies
                </Link>{" "}
                are illustrative and labelled as such. The free audit is the best way to judge how we think.
              </span>
            </p>
          </div>
        </div>
      </Section>

      <FooterCta />
    </>
  );
}
