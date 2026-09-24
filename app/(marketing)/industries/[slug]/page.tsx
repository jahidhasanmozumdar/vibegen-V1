import { ArrowRight, Check, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHead } from "@/components/home/section-head";
import { IndustryFunnel } from "@/components/pages/industries/visual";
import { CtaPair, FaqBlock, LinkCard, Section, VisualStage } from "@/components/pages/services/shared";
import { ServiceMini } from "@/components/pages/services/visuals";
import { FooterCta } from "@/components/sections/cta-bands";
import { JsonLd, faqSchema } from "@/components/seo/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { cta } from "@/lib/config/site";
import { INDUSTRY_SLUGS, type IndustrySlug } from "@/lib/data/types";
import { pageMetadata } from "@/lib/seo/metadata";
import { getIndustries, getIndustry, getServices } from "@/lib/services/content";

export const revalidate = 300;

export function generateStaticParams() {
  return INDUSTRY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/industries/[slug]">) {
  const { slug } = await props.params;
  const industry = await getIndustry(slug);
  if (!industry) return {};
  return pageMetadata({ title: industry.name, description: industry.summary, path: `/industries/${industry.slug}`, seo: industry });
}

/** Serif accent inside each industry headline (falls back to none if the CMS text changes). */
const accents: Record<IndustrySlug, string> = {
  saas: "demos and trials,",
  "home-services": "ready to book.",
  "professional-services": "qualified consultations.",
  ecommerce: "revenue,",
};

/*
 * Industry detail — "Premium Calm": where these funnels leak → how we'd
 * approach it (dark panel) → the services we'd use → FAQ → other industries.
 */
export default async function IndustryPage(props: PageProps<"/industries/[slug]">) {
  const { slug } = await props.params;
  const industry = await getIndustry(slug);
  if (!industry) notFound();

  const [services, industries] = await Promise.all([getServices(), getIndustries()]);
  const relevant = industry.services.map((s) => services.find((x) => x.slug === s)).filter((s) => s !== undefined);
  const others = industries.filter((i) => i.slug !== industry.slug);
  const path = `/industries/${industry.slug}`;
  const position = industries.findIndex((i) => i.slug === industry.slug) + 1;

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Industries", path: "/industries" },
          { name: industry.name, path },
        ]}
        eyebrow={`${industry.name}${position > 0 ? ` · Industry ${position} of ${industries.length}` : ""}`}
        title={industry.headline}
        accent={accents[industry.slug]}
        lead={industry.summary}
        aside={
          <VisualStage caption="Illustrative example setup. Not client data.">
            <IndustryFunnel slug={industry.slug} />
          </VisualStage>
        }
      >
        <CtaPair />
      </PageHero>

      {/* 1. Challenge → approach */}
      <Section id="challenges-title">
        <SectionHead
          id="challenges-title"
          eyebrow="The problem, and our answer"
          title={
            <>
              Where these funnels leak, and <span className="pm-serif">how we&rsquo;d fix it.</span>
            </>
          }
          lede="The patterns we look for first in an audit, and the starting plan. It changes once we've seen your accounts, your numbers and how your sales process works."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-[1fr_1.15fr]">
          <div className="rounded-[24px] bg-soft p-8">
            <p className="pm-eyebrow">Where it leaks</p>
            <ul className="mt-6 space-y-6">
              {industry.challenges.map((c) => (
                <li key={c.title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#fdecea] text-[#b42318]">
                    <X className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[16.5px] font-semibold tracking-[-0.015em]">{c.title}</h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-fg-2">{c.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[24px] bg-fg p-8 text-white">
            <p className="font-mono text-[0.76rem] font-medium tracking-[0.04em] text-[#7fb2ff] uppercase">What we do</p>
            <ol className="mt-6 space-y-6">
              {industry.approach.map((a, i) => (
                <li key={a.title} className="flex items-start gap-3.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[13px] font-medium text-fg">{i + 1}</span>
                  <div>
                    <h3 className="text-[16.5px] font-semibold tracking-[-0.015em]">{a.title}</h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/70">{a.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href={cta.primary.href} className="pm-btn mt-9 bg-white text-fg hover:bg-white/90">
              Check mine in the free audit
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>

      {/* 2. Who it's for + honest note */}
      <Section id="fit-title" tone="line">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <SectionHead
              id="fit-title"
              eyebrow="Who this is for"
              title={
                <>
                  {industry.name} businesses <span className="pm-serif">we plan for.</span>
                </>
              }
            />
            {industry.examples.length > 0 ? (
              <ul className="mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {industry.examples.map((e) => (
                  <li key={e} className="flex items-start gap-2.5 text-[15.5px] text-fg-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2.5} aria-hidden="true" />
                    {e}
                  </li>
                ))}
              </ul>
            ) : null}
            {industry.focus.length > 0 ? (
              <>
                <p className="pm-eyebrow mt-10">What we focus on</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {industry.focus.map((f) => (
                    <li key={f} className="rounded-full bg-soft px-3 py-1.5 text-[14px] text-fg-2">
                      {f}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
          <aside aria-label="A straight answer" className="self-start rounded-[24px] border border-hair p-8">
            <span className="grid size-10 place-items-center rounded-[12px] bg-brand-soft text-brand">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-6 text-[19px] font-semibold tracking-[-0.02em]">Where are the {industry.name} results?</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-fg-2">
              Results we can&rsquo;t verify aren&rsquo;t shown. We don&rsquo;t publish borrowed logos or invented numbers. Ask how we&rsquo;d approach your funnel in an
              audit, and we&rsquo;ll show you exactly what we&rsquo;d change and why.
            </p>
            <Link href="/case-studies" className="group mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-medium text-brand">
              See labelled worked examples
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </Section>

      {/* 3. Relevant services */}
      <Section id="services-title" tone="soft">
        <SectionHead
          id="services-title"
          eyebrow="Relevant services"
          title={
            <>
              What we&rsquo;d use for <span className="pm-serif">{industry.name}.</span>
            </>
          }
          lede="Listed roughly in the order we'd usually start. The audit decides the actual order."
        />
        <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relevant.map((s, i) => (
            <li key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-hair bg-white transition-shadow hover:shadow-[0_24px_48px_-24px_rgb(10_13_20/0.22)]"
              >
                <div aria-hidden="true" className="flex h-44 items-center justify-center bg-[radial-gradient(120%_90%_at_50%_0%,#fbfbfa,#f3f3f0)] px-6">
                  <ServiceMini slug={s.slug} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="pm-eyebrow">Step {i + 1}</p>
                  <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.02em]">{s.name}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-fg-2">{s.tagline}</p>
                  <span className="mt-auto flex items-center gap-1.5 pt-5 text-[14.5px] font-medium text-brand">
                    Learn more
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-center text-[12.5px] text-fg-3">Previews are illustrative sample screens, not client data.</p>
      </Section>

      {industry.faqs.length > 0 ? (
        <>
          <FaqBlock id="industry-faq" title={`${industry.name}:`} accent="straight answers." items={industry.faqs} />
          <JsonLd data={faqSchema(industry.faqs)} />
        </>
      ) : null}

      {others.length > 0 ? (
        <Section id="others-title" tone="line">
          <SectionHead id="others-title" eyebrow="Other industries" title="Other funnels we work on" lede="Different buyers, different conversions, same discipline." />
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {others.map((i) => (
              <li key={i.slug}>
                <LinkCard href={`/industries/${i.slug}`} title={i.name} body={i.headline} meta="Industry" />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <FooterCta />
    </>
  );
}
