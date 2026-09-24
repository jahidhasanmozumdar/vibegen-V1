import { ArrowRight, Info } from "lucide-react";
import Link from "next/link";

import { SectionHead } from "@/components/home/section-head";
import { DemoLabel } from "@/components/pages/case-studies/demo-label";
import { CtaPair, Section } from "@/components/pages/services/shared";
import { FooterCta } from "@/components/sections/cta-bands";
import { PageHero } from "@/components/site/page-hero";
import { cta } from "@/lib/config/site";
import { industryLabels, serviceLabels } from "@/lib/data/labels";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCaseStudies } from "@/lib/services/content";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Case Studies",
  description:
    "How VibeGen approaches paid acquisition funnels for SaaS, home services, professional services and e-commerce. Illustrative examples are clearly labelled as demo data.",
  path: "/case-studies",
});

/** First paragraph of a markdown field, as plain text. */
function firstParagraph(md: string): string {
  return (md.split(/\n{2,}/)[0] ?? "").replace(/[*_`#>]/g, "").trim();
}

/*
 * Case studies — "Premium Calm". Every demo example carries the
 * "Illustrative Example — Demo Data" label, and each card reads
 * problem → our approach, with the approach highlighted.
 */
export default async function CaseStudiesPage() {
  const studies = await getCaseStudies();
  const hasDemo = studies.some((s) => s.is_demo);

  return (
    <>
      <PageHero
        crumbs={[{ name: "Case Studies", path: "/case-studies" }]}
        eyebrow={hasDemo ? "Illustrative examples" : "Case studies"}
        title="How we approach a funnel, shown honestly."
        accent="shown honestly."
        lead="VibeGen is a new studio. Rather than invent results, we've written illustrative examples of how we'd diagnose and rebuild common acquisition funnels. Real client work will appear here, with permission, as it happens."
        aside={
          hasDemo ? (
            <div role="note" className="rounded-[24px] border border-[#f5dcaa] bg-[#fffaf0] p-8">
              <DemoLabel />
              <p className="mt-5 text-[20px] leading-snug font-medium tracking-[-0.02em]">Every example on this page is demo data.</p>
              <p className="mt-3 text-[15px] leading-relaxed text-fg-2">
                None of them describes a real client, a real campaign or a real result. Any numbers are hypothetical, to show the kind of change we&rsquo;d measure.
              </p>
            </div>
          ) : undefined
        }
      >
        <CtaPair />
      </PageHero>

      {studies.length === 0 ? (
        <Section id="empty-title">
          <div className="mx-auto max-w-xl rounded-[24px] bg-soft p-10 text-center">
            <h2 id="empty-title" className="pm-h3">
              Nothing here yet
            </h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-fg-2">
              We&rsquo;ll publish case studies as client work allows. Until then, the audit is the best way to see how we think about your funnel.
            </p>
            <Link href={cta.primary.href} className="pm-btn pm-btn-dark mt-7">
              {cta.primary.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Section>
      ) : (
        <Section id="examples-title">
          <SectionHead
            id="examples-title"
            eyebrow={hasDemo ? "Illustrative examples" : "Case studies"}
            title={
              <>
                The problem, and <span className="pm-serif">what we&rsquo;d do.</span>
              </>
            }
            lede="Each one starts with a common funnel problem and walks through how we'd diagnose it and what we'd change."
          />
          <ol className="mt-14 space-y-4">
            {studies.map((study, i) => (
              <li key={study.id}>
                <article className="group relative grid overflow-hidden rounded-[24px] border border-hair transition-shadow hover:shadow-[0_24px_48px_-24px_rgb(10_13_20/0.22)] lg:grid-cols-[1.1fr_1fr]">
                  <div className="p-7 sm:p-9">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[12px] text-fg-3">{String(i + 1).padStart(2, "0")}</span>
                      {study.is_demo ? <DemoLabel /> : null}
                    </div>
                    <h2 className="mt-5 text-[clamp(1.4rem,1.1rem+0.9vw,1.9rem)] leading-[1.15] font-semibold tracking-[-0.03em]">
                      <Link href={`/case-studies/${study.slug}`} className="after:absolute after:inset-0">
                        {study.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-[14px] text-fg-3">
                      {study.client}
                      {study.industry ? <> · {industryLabels[study.industry]}</> : null}
                    </p>
                    <p className="mt-5 text-[15.5px] leading-relaxed text-fg-2">{study.excerpt}</p>
                    <ul className="mt-6 flex flex-wrap gap-2" aria-label="Services">
                      {study.services.map((s) => (
                        <li key={s} className="rounded-full bg-soft px-3 py-1 text-[13px] text-fg-2">
                          {serviceLabels[s]}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col bg-fg p-7 text-white sm:p-9">
                    <p className="pm-eyebrow">The problem</p>
                    <p className="mt-3 line-clamp-4 text-[14.5px] leading-relaxed text-white/60">{firstParagraph(study.challenge)}</p>
                    <p className="mt-6 font-mono text-[0.76rem] font-medium tracking-[0.04em] text-[#7fb2ff] uppercase">What we&rsquo;d do</p>
                    <p className="mt-3 line-clamp-5 text-[15px] leading-relaxed text-white/90">{firstParagraph(study.strategy)}</p>
                    <span className="mt-auto flex items-center gap-1.5 pt-7 text-[14.5px] font-medium">
                      View Case Study
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </article>
              </li>
            ))}
          </ol>
          {hasDemo ? (
            <p className="mt-8 flex items-start justify-center gap-2 text-center text-[13.5px] text-fg-3">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Examples labelled &ldquo;Illustrative Example — Demo Data&rdquo; are hypothetical and do not describe real clients.
            </p>
          ) : null}
        </Section>
      )}

      <FooterCta />
    </>
  );
}
