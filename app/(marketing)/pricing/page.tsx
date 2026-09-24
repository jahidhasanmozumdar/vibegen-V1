import Link from "next/link";
import { ArrowDown, KeyRound } from "lucide-react";

import { SectionHead } from "@/components/home/section-head";
import { PlanComparison } from "@/components/pages/pricing/comparison";
import { FooterCta } from "@/components/sections/cta-bands";
import { PricingCards, PricingDisclaimer } from "@/components/sections/pricing-cards";
import { Crosses, FaqList, FixLedger, GlanceCard, Section, Ticks } from "@/components/sections/primitives";
import { JsonLd, faqSchema } from "@/components/seo/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { TrackView } from "@/components/tracking/attribution-capture";
import { ButtonLink } from "@/components/ui/button";
import { generalFaqs } from "@/lib/content/faqs";
import { clientOwnership, serviceScope } from "@/lib/content/pricing";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPricingPlans } from "@/lib/services/content";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Clear monthly pricing for Meta Ads, Google Ads, landing pages, CRO and tracking. Launch from $1,250/month. Ad spend is paid directly to the platforms. No performance guarantees.",
  path: "/pricing",
});

/** Why the pricing is shaped this way: problem → cause → our fix. */
const pricingLogic = [
  {
    problem: "Agency fees that grow every time your ad budget grows.",
    cause: "A percentage-of-spend fee rewards spending more, not spending better.",
    fix: "A flat monthly fee per plan. Spending less on waste never costs us anything, so we can tell you to cut.",
  },
  {
    problem: "You can't see what actually reached Meta and Google.",
    cause: "Budgets run through the agency's accounts and come back as an invoice line.",
    fix: "Ad spend is billed by Meta and Google to your own accounts. Our fee is separate and never touches it.",
  },
  {
    problem: "Optimizing on numbers nobody trusts.",
    cause: "Tracking is sold as an add-on, so it's the first thing skipped.",
    fix: "GA4, GTM, the Meta Pixel and conversion tracking are part of every plan, including the smallest.",
  },
];

const notIncluded = [
  "Ad spend (paid to Meta and Google directly)",
  "Photo and video shoots, new brand design",
  "Full website builds",
  "Social media management",
  "Guaranteed leads, sales, CPL or ROAS",
];

const pricingFaqs = generalFaqs;

export default async function PricingPage() {
  const plans = await getPricingPlans();
  const byPrice = [...plans].sort((a, b) => a.monthly_price - b.monthly_price);
  const cheapest = byPrice[0];
  const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  const glance = [
    ...(cheapest ? [{ term: "Plans from", value: `${usd(cheapest.monthly_price)} / month` }] : []),
    { term: "Plans", value: `${plans.length}, billed monthly` },
    { term: "Ad spend", value: "Paid to Meta & Google directly" },
    { term: "Tracking", value: "Included on every plan" },
  ];

  return (
    <>
      <TrackView event="pricing_view" />
      <JsonLd data={faqSchema(pricingFaqs)} />

      <PageHero
        crumbs={[{ name: "Pricing", path: "/pricing" }]}
        eyebrow="Three plans · USD · billed monthly"
        title="Straightforward pricing. Ad spend stays in your account."
        accent="your account."
        lead="Three plans based on how much you spend on ads and how much of the funnel you need managed. Every plan includes tracking, because optimizing on bad data wastes money."
        aside={<GlanceCard title="Pricing at a glance" rows={glance} footer="Prices in USD. Standard terms: a 3-month minimum, then month-to-month." />}
      >
        <ButtonLink href="#plans" size="lg" iconRight={<ArrowDown className="size-4" aria-hidden="true" />}>
          Compare the plans
        </ButtonLink>
        <ButtonLink href="/free-growth-audit" size="lg" variant="outline">
          Get a Free Growth Audit
        </ButtonLink>
      </PageHero>

      <Section id="plans" labelledBy="plans-title">
        <SectionHead
          id="plans-title"
          eyebrow="Plans"
          align="center"
          title={
            <>
              Pick the plan that fits your <span className="pm-serif">ad spend.</span>
            </>
          }
          lede="Same way of working on every plan. The plan sets how much of the funnel we run each month."
        />
        <PricingCards plans={plans} className="mt-14" />
        <PricingDisclaimer className="mt-4" />
      </Section>

      <Section id="compare" labelledBy="compare-title" tone="soft">
        <SectionHead
          id="compare-title"
          eyebrow="Compare"
          title={
            <>
              Every feature, <span className="pm-serif">side by side.</span>
            </>
          }
          lede="The difference between plans is scope and pace, not quality. Tracking is on every row that matters."
        />
        <div className="mt-12">
          <PlanComparison plans={plans} />
        </div>
      </Section>

      <Section id="why" labelledBy="why-title">
        <SectionHead
          id="why-title"
          eyebrow="Why it's priced this way"
          title={
            <>
              A fee that doesn&apos;t reward <span className="pm-serif">wasted spend.</span>
            </>
          }
          lede="Most pricing problems with agencies come from how the fee is built. Here's the problem, the real cause, and what we do instead."
        />
        <FixLedger rows={pricingLogic} className="mt-12" />
      </Section>

      <Section id="scope" labelledBy="scope-title" bordered>
        <SectionHead
          id="scope-title"
          eyebrow="What every plan includes"
          title={
            <>
              What&apos;s included, and what <span className="pm-serif">isn&apos;t.</span>
            </>
          }
          lede="Same scope on every plan. You bring the assets and the offer; we run the system around them."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="pm-card p-7 sm:p-8">
            <h3 className="text-[17px] font-semibold tracking-[-0.02em]">We handle</h3>
            <Ticks items={serviceScope.weHandle} className="mt-5 grid gap-x-6 gap-y-3 space-y-0 sm:grid-cols-2" />
          </div>
          <div className="grid gap-4">
            <div className="rounded-[20px] bg-soft p-7 sm:p-8">
              <h3 className="text-[17px] font-semibold tracking-[-0.02em]">You provide</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {serviceScope.clientProvides.map((x) => (
                  <li key={x} className="rounded-full bg-white px-3 py-1.5 text-[14px] text-fg-2">
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13.5px] leading-relaxed text-fg-3">{serviceScope.note}</p>
            </div>
            <div className="pm-card p-7 sm:p-8">
              <h3 className="text-[17px] font-semibold tracking-[-0.02em]">Not included</h3>
              <Crosses items={notIncluded} className="mt-4" />
            </div>
          </div>
        </div>
      </Section>

      <section aria-labelledby="ownership-title" className="pm-wrap py-6">
        <div className="grid gap-10 rounded-[32px] bg-fg px-6 py-14 text-white sm:px-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-16 lg:py-20">
          <div>
            <p className="font-mono text-[12px] tracking-wide text-white/50 uppercase">You own your accounts</p>
            <h2 id="ownership-title" className="pm-h2 mt-5">
              Everything stays in <span className="pm-serif text-[#7fb2ff]">your name.</span>
            </h2>
            <p className="mt-5 max-w-lg text-[16.5px] leading-relaxed text-white/65">{clientOwnership.intro}</p>
          </div>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
            {clientOwnership.assets.map((asset) => (
              <li key={asset} className="flex items-center gap-2.5 rounded-[14px] bg-white/[0.06] px-4 py-3.5 text-[14.5px] text-white/90">
                <KeyRound className="size-4 shrink-0 text-[#7fb2ff]" aria-hidden="true" />
                {asset}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Section id="faq" labelledBy="faq-title">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <div className="lg:sticky lg:top-24">
              <SectionHead
                id="faq-title"
                eyebrow="FAQ"
                title={
                  <>
                    About pricing and <span className="pm-serif">working together.</span>
                  </>
                }
                lede={
                  <>
                    Something not covered?{" "}
                    <Link href="/contact" className="pm-link">
                      Ask us directly
                    </Link>
                    .
                  </>
                }
              />
            </div>
          </div>
          <FaqList items={pricingFaqs} />
        </div>
      </Section>

      <FooterCta />
    </>
  );
}
