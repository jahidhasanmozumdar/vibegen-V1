import { ArrowLeft, ArrowRight, FlaskConical } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { DemoLabel, proseClasses } from "@/components/pages/case-studies/demo-label";
import { SampleTag } from "@/components/pages/services/shared";
import { FooterCta } from "@/components/sections/cta-bands";
import { PageHero } from "@/components/site/page-hero";
import { TrackView } from "@/components/tracking/attribution-capture";
import { industryLabels, serviceLabels } from "@/lib/data/labels";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCaseStudies, getCaseStudy, getTestimonial } from "@/lib/services/content";
import { cn } from "@/lib/utils/cn";
import { Markdown } from "@/lib/utils/markdown";

export const revalidate = 300;

export async function generateStaticParams() {
  const studies = await getCaseStudies();
  return studies.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: PageProps<"/case-studies/[slug]">) {
  const { slug } = await props.params;
  const study = await getCaseStudy(slug);
  if (!study) return { title: "Case study not found", robots: { index: false } };
  return pageMetadata({
    title: study.is_demo ? `${study.title} (Illustrative example)` : study.title,
    description: study.excerpt,
    path: `/case-studies/${study.slug}`,
    seo: study,
  });
}

/*
 * The argument, in order: the problem → the real cause and plan → what we'd
 * do (highlighted) → what it would change.
 */
const sections = [
  { key: "challenge", eyebrow: "01 · The problem", title: "Challenge", tone: "plain" },
  { key: "strategy", eyebrow: "02 · The plan", title: "Strategy", tone: "brand" },
  { key: "execution", eyebrow: "03 · What we do", title: "Execution", tone: "brand" },
  { key: "results", eyebrow: "04 · What changes", title: "Results", tone: "plain" },
] as const;

export default async function CaseStudyPage(props: PageProps<"/case-studies/[slug]">) {
  const { slug } = await props.params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();

  const testimonial = await getTestimonial(study.testimonial_id);
  const path = `/case-studies/${study.slug}`;

  const facts = [
    { term: "Client", value: study.client as ReactNode },
    study.industry
      ? {
          term: "Industry",
          value: (
            <Link href={`/industries/${study.industry}`} className="pm-link">
              {industryLabels[study.industry]}
            </Link>
          ) as ReactNode,
        }
      : null,
    study.duration ? { term: "Duration", value: study.duration as ReactNode } : null,
    study.ad_spend ? { term: "Ad spend", value: study.ad_spend as ReactNode } : null,
  ].filter((f): f is { term: string; value: ReactNode } => f !== null);

  const accent = study.is_demo && study.title.startsWith("Illustrative") ? "Illustrative" : undefined;

  return (
    <>
      <TrackView event="case_study_view" params={{ slug: study.slug }} />

      {study.is_demo ? (
        <div role="note" className="border-b border-[#f5dcaa] bg-[#fffaf0]">
          <p className="pm-wrap flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-[14px] text-fg-2">
            <DemoLabel />
            <span>Not a client result. It shows how we&rsquo;d approach this kind of funnel.</span>
          </p>
        </div>
      ) : null}

      <PageHero
        crumbs={[
          { name: "Case Studies", path: "/case-studies" },
          { name: study.title, path },
        ]}
        eyebrow={study.is_demo ? "Illustrative example" : "Case study"}
        title={study.title}
        accent={accent}
        lead={study.excerpt}
        aside={
          <div className="rounded-[24px] border border-hair p-7">
            {study.is_demo ? <DemoLabel /> : <p className="pm-eyebrow">At a glance</p>}
            <dl className="mt-6 divide-y divide-hair border-y border-hair text-[15px]">
              {facts.map((f) => (
                <div key={f.term} className="flex items-baseline justify-between gap-6 py-3.5">
                  <dt className="text-fg-3">{f.term}</dt>
                  <dd className="text-right font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
            {study.services.length > 0 ? (
              <>
                <p className="pm-eyebrow mt-6">Services</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {study.services.map((s) => (
                    <li key={s}>
                      <Link href={`/services/${s}`} className="inline-block rounded-full bg-soft px-3 py-1 text-[13px] text-fg-2 hover:text-fg">
                        {serviceLabels[s]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        }
      />

      <div className="pm-wrap py-20 lg:py-28">
        <div className="space-y-4">
          {sections.map((section) => (
            <section
              key={section.key}
              id={section.key}
              aria-labelledby={`cs-${section.key}`}
              className={cn("grid gap-6 rounded-[24px] p-7 sm:p-10 lg:grid-cols-[0.35fr_1fr] lg:gap-12", section.tone === "brand" ? "bg-brand-soft" : "border border-hair")}
            >
              <div>
                <p className={cn("pm-eyebrow", section.tone === "brand" && "text-brand")}>{section.eyebrow}</p>
                <h2 id={`cs-${section.key}`} className="mt-3 text-[1.6rem] font-semibold tracking-[-0.03em]">
                  {section.title}
                </h2>
              </div>
              <div className="min-w-0">
                <div className={proseClasses}>
                  <Markdown source={study[section.key]} />
                </div>

                {section.key === "results" && study.metrics.length > 0 ? (
                  <div className="mt-10 overflow-hidden rounded-[16px] border border-hair bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair bg-[#fbfbfa] px-5 py-3">
                      <h3 id="cs-metrics" className="text-[14px] font-semibold tracking-tight">
                        Metrics
                      </h3>
                      {study.is_demo ? <SampleTag>Illustrative — not client data</SampleTag> : null}
                    </div>
                    <div className="overflow-x-auto">
                      <table aria-labelledby="cs-metrics" className="w-full min-w-[30rem] text-left text-[14.5px]">
                        <thead>
                          <tr className="text-[12.5px] text-fg-3">
                            <th scope="col" className="px-5 pt-3 pb-2 font-normal">
                              Metric
                            </th>
                            <th scope="col" className="px-5 pt-3 pb-2 font-normal">
                              Before
                            </th>
                            <th scope="col" className="px-5 pt-3 pb-2 font-normal">
                              After
                            </th>
                            <th scope="col" className="px-5 pt-3 pb-2 font-normal">
                              Note
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-hair border-t border-hair">
                          {study.metrics.map((m) => (
                            <tr key={m.label}>
                              <th scope="row" className="px-5 py-3.5 font-medium">
                                {m.label}
                              </th>
                              <td className="px-5 py-3.5 text-fg-3 tabular-nums">{m.before ?? "—"}</td>
                              <td className="px-5 py-3.5 font-medium tabular-nums">{m.after ?? "—"}</td>
                              <td className="px-5 py-3.5 text-fg-3">
                                {study.is_demo ? <span className="text-[#b54708]">Illustrative</span> : (m.note ?? "—")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {study.is_demo ? (
                      <p className="flex items-start gap-2 border-t border-hair px-5 py-3 text-[13px] text-fg-3">
                        <FlaskConical className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        Hypothetical numbers to show the kind of change we&rsquo;d measure. Not a client result or a forecast.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {section.key === "results" && testimonial ? (
                  <figure className="mt-10 rounded-[16px] bg-soft p-7">
                    {testimonial.is_demo ? <DemoLabel className="mb-5">Demo Data</DemoLabel> : null}
                    <blockquote className="text-[19px] leading-snug font-medium tracking-[-0.02em]">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                    <figcaption className="mt-4 text-[14px] text-fg-3">
                      <span className="text-fg">{testimonial.name}</span>
                      {[testimonial.role, testimonial.company].filter(Boolean).length > 0 ? <>, {[testimonial.role, testimonial.company].filter(Boolean).join(", ")}</> : null}
                    </figcaption>
                  </figure>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        {study.services.length > 0 ? (
          <section aria-labelledby="cs-services" className="mt-16">
            <h2 id="cs-services" className="pm-eyebrow">
              Services used
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {study.services.map((s) => (
                <li key={s}>
                  <Link href={`/services/${s}`} className="group pm-card flex h-full flex-col gap-3 p-5 transition-shadow hover:shadow-[0_24px_48px_-24px_rgb(10_13_20/0.22)]">
                    <span className="text-[16px] font-semibold tracking-[-0.015em]">{serviceLabels[s]}</span>
                    <span className="flex items-center gap-1 text-[14px] font-medium text-brand">
                      Learn More
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/case-studies" className="mt-8 inline-flex items-center gap-1.5 text-[15px] font-medium text-fg-2 hover:text-fg">
              <ArrowLeft className="size-4" aria-hidden="true" />
              All case studies
            </Link>
          </section>
        ) : null}
      </div>

      <FooterCta />
    </>
  );
}
