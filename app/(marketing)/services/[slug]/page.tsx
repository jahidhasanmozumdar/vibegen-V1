import { ArrowRight, Check, KeyRound, Minus, Package, Quote } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHead } from "@/components/home/section-head";
import { ServiceExplainer } from "@/components/pages/services/explainer";
import { heroCopy, honestLine, relatedServices, sentenceCase, serviceLedger, stageFor } from "@/components/pages/services/meta";
import { CtaPair, FaqBlock, Ledger, LinkCard, Section, VisualStage } from "@/components/pages/services/shared";
import { ServiceMini, ServiceVisual } from "@/components/pages/services/visuals";
import { FooterCta } from "@/components/sections/cta-bands";
import { JsonLd, faqSchema, serviceSchema } from "@/components/seo/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { TrackView } from "@/components/tracking/attribution-capture";
import { clientOwnership, serviceScope } from "@/lib/content/pricing";
import { SERVICE_SLUGS } from "@/lib/data/types";
import { pageMetadata } from "@/lib/seo/metadata";
import { getIndustries, getService, getServices } from "@/lib/services/content";

export const revalidate = 300;

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/services/[slug]">) {
  const { slug } = await props.params;
  const service = await getService(slug);
  if (!service) return {};
  return pageMetadata({ title: service.name, description: service.summary, path: `/services/${service.slug}`, seo: service });
}

/*
 * Service detail — "Premium Calm". Argues problem → real cause → what we do,
 * then shows the work, the mechanism, the outcome, the scope and the FAQs.
 */
export default async function ServicePage(props: PageProps<"/services/[slug]">) {
  const { slug } = await props.params;
  const service = await getService(slug);
  if (!service) notFound();

  const [services, industries] = await Promise.all([getServices(), getIndustries()]);
  const stage = stageFor(service.slug);
  const path = `/services/${service.slug}`;
  const paragraphs = service.description.split(/\n{2,}/).filter(Boolean);
  const related = relatedServices[service.slug].map((s) => services.find((x) => x.slug === s)).filter((s) => s !== undefined);
  const goodFor = industries.filter((i) => i.services.includes(service.slug));
  const position = services.findIndex((s) => s.slug === service.slug) + 1;
  const hero = heroCopy[service.slug];
  const isMeta = service.slug === "meta-ads";

  return (
    <>
      <TrackView event="service_view" params={{ service: service.slug }} />
      <JsonLd data={serviceSchema({ name: service.name, description: service.summary, path })} />

      <PageHero
        crumbs={[
          { name: "Services", path: "/services" },
          { name: service.name, path },
        ]}
        eyebrow={[position > 0 ? `Service ${position} of ${services.length}` : "Service", stage ? sentenceCase(stage.label) : null].filter(Boolean).join(" · ")}
        title={hero.title}
        accent={hero.accent}
        lead={service.tagline}
        aside={
          <VisualStage>
            <ServiceVisual slug={service.slug} />
          </VisualStage>
        }
      >
        <CtaPair />
      </PageHero>

      {/* 1. The argument: problem → cause → what we do */}
      <Section id="why-title">
        <SectionHead
          id="why-title"
          eyebrow="The real problem"
          title={
            <>
              What&rsquo;s usually going wrong, and <span className="pm-serif">what we do about it.</span>
            </>
          }
          lede={service.summary}
        />
        <Ledger rows={serviceLedger[service.slug]} />
      </Section>

      {/* 2. Approach in their words + the honest line */}
      <Section id="approach-title" tone="soft">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div>
            <p className="pm-eyebrow">How we approach it</p>
            <h2 id="approach-title" className="pm-h2 mt-5">
              {service.name}, <span className="pm-serif">done properly.</span>
            </h2>
            <div className="mt-8 space-y-5 text-[16.5px] leading-relaxed text-fg-2">
              {paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </div>
          <aside aria-label="Worth knowing up front" className="self-start rounded-[24px] bg-white p-8 lg:sticky lg:top-28">
            <Quote className="size-6 text-brand" aria-hidden="true" />
            <p className="pm-eyebrow mt-5">Worth knowing up front</p>
            <p className="mt-3 text-[20px] leading-snug font-medium tracking-[-0.02em]">{honestLine[service.slug]}</p>
            <Link href="/pricing" className="group mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-medium text-brand">
              See plans and what affects results
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </Section>

      {/* 3. What we do: features, solution-first */}
      <Section id="work-title">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHead
              id="work-title"
              eyebrow="What we do"
              title={
                <>
                  The work, <span className="pm-serif">in practice.</span>
                </>
              }
              lede={`What running ${service.name} with us actually involves, week to week.`}
            />
            <div className="mt-10 rounded-[20px] border border-hair p-6">
              <p className="pm-eyebrow">Capabilities</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {service.capabilities.map((c) => (
                  <li key={c} className="rounded-full bg-soft px-3 py-1.5 text-[13.5px] text-fg-2">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <ol className="border-t border-hair">
            {service.features.map((f, i) => (
              <li key={f.title} className="grid grid-cols-[auto_1fr] gap-x-5 border-b border-hair py-7">
                <span className="grid size-9 place-items-center rounded-full bg-fg text-[14px] font-medium text-white">{i + 1}</span>
                <div>
                  <h3 className="text-[19px] font-semibold tracking-[-0.025em]">{f.title}</h3>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-fg-2">{f.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 4. Mechanism specific to the service */}
      <ServiceExplainer slug={service.slug} />

      {/* 5. What changes for you */}
      <Section id="get-title" tone="soft">
        <SectionHead
          id="get-title"
          eyebrow="What changes for you"
          title={
            <>
              Built to improve, <span className="pm-serif">not to promise.</span>
            </>
          }
          lede="No promised numbers: results depend on your offer, market, budget and follow-up. This is what the work is built to improve."
        />
        <ul className="mt-14 grid gap-4 md:grid-cols-2">
          {service.benefits.map((b) => (
            <li key={b.title} className="rounded-[20px] bg-white p-7">
              <p className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                  <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span className="text-[18px] leading-snug font-semibold tracking-[-0.02em]">{b.title}</span>
              </p>
              <p className="mt-3 pl-9 text-[15px] leading-relaxed text-fg-2">{b.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 6. Scope */}
      <Section id="scope-title">
        <SectionHead
          id="scope-title"
          eyebrow="Scope"
          title={
            <>
              What&rsquo;s included, and <span className="pm-serif">what isn&rsquo;t.</span>
            </>
          }
          lede="Clear scope up front saves awkward conversations later. Ad spend is always paid by you, directly to the platforms."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-[24px] bg-fg p-8 text-white">
            <h3 className="text-[17px] font-semibold tracking-[-0.02em]">Included</h3>
            <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {service.included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] text-white/85">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#7fb2ff]" strokeWidth={2.5} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-7 flex items-start gap-2.5 border-t border-white/10 pt-6 text-[14px] leading-relaxed text-white/60">
              <KeyRound className="mt-0.5 size-4 shrink-0 text-[#7fb2ff]" aria-hidden="true" />
              {clientOwnership.intro}
            </p>
          </div>
          <div className="pm-card p-8">
            <h3 className="text-[17px] font-semibold tracking-[-0.02em]">Not included</h3>
            <ul className="mt-5 space-y-3">
              {service.not_included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] text-fg-2">
                  <Minus className="mt-0.5 size-4 shrink-0 text-fg-3" strokeWidth={2.5} aria-hidden="true" />
                  <span>
                    <span className="sr-only">Not included: </span>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            {isMeta ? (
              <div className="mt-6 flex items-start gap-3 rounded-[14px] bg-[#fff8eb] p-4">
                <Package className="mt-0.5 size-4.5 shrink-0 text-[#b54708]" aria-hidden="true" />
                <p className="text-[14px] leading-relaxed text-fg-2">
                  <span className="font-medium text-fg">Creative production is not included.</span> You provide the{" "}
                  {serviceScope.clientProvides.slice(0, 3).join(", ").toLowerCase()}. We write the copy and structure the tests around them.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </Section>

      {/* 7. Works well for + often paired with */}
      <Section id="fit-title" tone="line">
        <SectionHead
          id="fit-title"
          eyebrow="Works well for"
          title={
            <>
              Where we use <span className="pm-serif">{service.name}.</span>
            </>
          }
          lede="The industries where this service usually does the heavy lifting, and the services it's most often paired with."
        />
        {goodFor.length > 0 ? (
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {goodFor.map((i) => (
              <li key={i.slug}>
                <LinkCard href={`/industries/${i.slug}`} title={i.name} body={i.headline} meta="Industry" />
              </li>
            ))}
          </ul>
        ) : null}
        <h3 className="mt-16 text-[17px] font-semibold tracking-[-0.02em]">Often paired with</h3>
        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {related.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/services/${r.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-hair bg-white transition-shadow hover:shadow-[0_24px_48px_-24px_rgb(10_13_20/0.22)]"
              >
                <div aria-hidden="true" className="flex h-44 items-center justify-center bg-[radial-gradient(120%_90%_at_50%_0%,#fbfbfa,#f3f3f0)] px-6">
                  <ServiceMini slug={r.slug} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[18px] font-semibold tracking-[-0.02em]">{r.name}</p>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-fg-2">{r.tagline}</p>
                  <span className="mt-auto flex items-center gap-1.5 pt-5 text-[14.5px] font-medium text-brand">
                    Learn more
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-[12.5px] text-fg-3">Previews are illustrative sample screens, not client data.</p>
      </Section>

      {service.faqs.length > 0 ? (
        <>
          <FaqBlock id="service-faq" title={`${service.name}:`} accent="straight answers." items={service.faqs} />
          <JsonLd data={faqSchema(service.faqs)} />
        </>
      ) : null}

      <FooterCta />
    </>
  );
}
