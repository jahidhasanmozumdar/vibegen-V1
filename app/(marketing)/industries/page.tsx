import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { SectionHead } from "@/components/home/section-head";
import { FunnelTypes } from "@/components/pages/industries/visual";
import { CtaPair, Ledger, Section, VisualStage } from "@/components/pages/services/shared";
import { FooterCta } from "@/components/sections/cta-bands";
import { PageHero } from "@/components/site/page-hero";
import { cta } from "@/lib/config/site";
import { pageMetadata } from "@/lib/seo/metadata";
import { getIndustries } from "@/lib/services/content";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Industries: SaaS, Home Services, Professional Services & E-commerce",
  description:
    "How we approach paid acquisition, landing pages and tracking for SaaS, home services, professional services and e-commerce businesses in the US and UK.",
  path: "/industries",
});

/*
 * Industries index — "Premium Calm": the leak each funnel usually has and what
 * we do about it, the four industries, and an honest "not on the list" close.
 */
export default async function IndustriesPage() {
  const industries = await getIndustries();

  return (
    <>
      <PageHero
        crumbs={[{ name: "Industries", path: "/industries" }]}
        eyebrow={`${industries.length} industries · US & UK`}
        title="Different businesses. Different funnels."
        accent="Different funnels."
        lead="A SaaS demo funnel and an emergency plumber's phone line need very different campaigns, pages and tracking. Here's how we'd approach each one."
        aside={
          <VisualStage caption="Illustrative example setup. Not client data.">
            <FunnelTypes industries={industries} />
          </VisualStage>
        }
      >
        <CtaPair />
      </PageHero>

      {/* 1. The argument, per industry */}
      <Section id="leaks-title">
        <SectionHead
          id="leaks-title"
          eyebrow="Where each funnel leaks"
          title={
            <>
              Same ad platforms. <span className="pm-serif">Different leaks.</span>
            </>
          }
          lede="The most common problem we look for first in each industry, what's really behind it, and what we do about it."
        />
        <Ledger
          rows={industries
            .filter((i) => i.challenges.length > 0 && i.approach.length > 0)
            .map((i) => ({
              problem: (
                <>
                  <span className="mb-1.5 block font-mono text-[11px] font-normal tracking-wide text-fg-3 uppercase">{i.name}</span>
                  {i.challenges[0].title}
                </>
              ),
              cause: i.challenges[0].body,
              fix: (
                <>
                  <span className="font-medium text-white">{i.approach[0].title}. </span>
                  {i.approach[0].body}
                </>
              ),
              href: `/industries/${i.slug}`,
              linkLabel: `Our ${i.name} approach`,
            }))}
        />
      </Section>

      {/* 2. The industries */}
      <Section id="who-title" tone="soft">
        <SectionHead
          id="who-title"
          eyebrow="Who we work with"
          title={
            <>
              Four funnels we <span className="pm-serif">know well.</span>
            </>
          }
          lede="Each gets its own campaigns, landing pages and tracking plan, built around the conversion that actually makes you money."
        />
        <ul className="mt-14 grid gap-4 md:grid-cols-2">
          {industries.map((ind) => (
            <li key={ind.slug}>
              <Link href={`/industries/${ind.slug}`} className="group flex h-full flex-col rounded-[22px] bg-white p-8 transition-shadow hover:shadow-[0_24px_48px_-24px_rgb(10_13_20/0.22)]">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="pm-h3">{ind.name}</h3>
                  <ArrowUpRight className="size-5 shrink-0 text-fg-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" aria-hidden="true" />
                </div>
                <p className="mt-3 text-[16px] leading-snug font-medium tracking-[-0.015em]">{ind.headline}</p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-fg-2">{ind.summary}</p>
                {ind.focus.length > 0 ? (
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label="Focus areas">
                    {ind.focus.map((f) => (
                      <li key={f} className="rounded-full bg-soft px-3 py-1 text-[13px] text-fg-2">
                        {f}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <span className="mt-auto flex items-center gap-1.5 pt-7 text-[14.5px] font-medium text-brand">
                  Learn more
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* 3. Not on the list + honesty */}
      <Section id="other-title">
        <SectionHead
          id="other-title"
          eyebrow="Not on the list?"
          title={
            <>
              The fundamentals don&rsquo;t <span className="pm-serif">change much.</span>
            </>
          }
          lede="Who is searching, what the page promises, and whether you can see which clicks become customers: the same questions apply to almost any business."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          <div className="pm-card flex flex-col p-8">
            <h3 className="text-[19px] font-semibold tracking-[-0.02em]">Sell something else?</h3>
            <p className="mt-3 text-[15.5px] leading-relaxed text-fg-2">
              The audit will show both of us whether we&rsquo;re a good fit. If we&rsquo;re not, we&rsquo;ll say so and tell you what we&rsquo;d look for in someone who is.
            </p>
            <div className="mt-auto pt-8">
              <Link href={cta.secondary.href} className="pm-btn pm-btn-light">
                {cta.secondary.label}
              </Link>
            </div>
          </div>
          <div className="flex flex-col rounded-[20px] bg-fg p-8 text-white">
            <h3 className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.02em]">
              <ShieldCheck className="size-5 text-[#7fb2ff]" aria-hidden="true" />
              No industry results we can&rsquo;t verify
            </h3>
            <p className="mt-3 text-[15.5px] leading-relaxed text-white/70">
              We&rsquo;re a new studio, so you won&rsquo;t find borrowed logos or invented case numbers here. Ask us how we&rsquo;d approach your funnel and we&rsquo;ll
              show you exactly what we&rsquo;d change, and why.
            </p>
            <div className="mt-auto pt-8">
              <Link href={cta.primary.href} className="pm-btn bg-white text-fg hover:bg-white/90">
                {cta.primary.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <FooterCta />
    </>
  );
}
