import { ArrowRight, Check, KeyRound, Package } from "lucide-react";
import Link from "next/link";

import { SectionHead } from "@/components/home/section-head";
import { serviceIndexLedger } from "@/components/pages/services/meta";
import { CtaPair, Ledger, Section, VisualStage } from "@/components/pages/services/shared";
import { SystemPanel } from "@/components/pages/services/system-panel";
import { ServiceMini } from "@/components/pages/services/visuals";
import { FooterCta } from "@/components/sections/cta-bands";
import { PageHero } from "@/components/site/page-hero";
import { growthSystem } from "@/lib/content/process";
import { clientOwnership, serviceScope } from "@/lib/content/pricing";
import { pageMetadata } from "@/lib/seo/metadata";
import { getServices } from "@/lib/services/content";
import { cn } from "@/lib/utils/cn";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Services: Meta Ads, Google Ads, Landing Pages, CRO & Analytics",
  description:
    "Five services run as one acquisition system: Meta Ads, Google Ads, conversion landing pages, CRO and analytics & tracking, for businesses in the US and UK.",
  path: "/services",
});

// Bento spans on large screens: two wide cards on top, three below.
const spans = ["lg:col-span-3", "lg:col-span-3", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2"];

/*
 * Services index — "Premium Calm": where the money leaks (problem → cause →
 * which service fixes it), the five services, how they connect, and scope.
 */
export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHero
        crumbs={[{ name: "Services", path: "/services" }]}
        eyebrow="Five services · one system"
        title="Five services. One acquisition system."
        accent="One acquisition system."
        lead="Meta Ads and Google Ads bring the traffic. Landing pages and CRO turn it into leads and sales. Analytics shows which parts are working. Start with one; they're built to run together."
        aside={
          <VisualStage>
            <SystemPanel />
          </VisualStage>
        }
      >
        <CtaPair />
      </PageHero>

      {/* 1. The argument: where the money leaks, and which service fixes it */}
      <Section id="leaks-title">
        <SectionHead
          id="leaks-title"
          eyebrow="Where the money goes"
          title={
            <>
              Most ad budgets don&rsquo;t fail at the ad. <span className="pm-serif">They leak after it.</span>
            </>
          }
          lede="Each leak has a real cause, and each of our services exists to fix one of them."
        />
        <Ledger
          fixLabel="The fix"
          rows={services.map((s) => ({
            problem: serviceIndexLedger[s.slug].problem,
            cause: serviceIndexLedger[s.slug].cause,
            fix: serviceIndexLedger[s.slug].fix,
            href: `/services/${s.slug}`,
            linkLabel: `How ${s.name} works`,
          }))}
        />
      </Section>

      {/* 2. The five services */}
      <Section id="all-services" tone="soft">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="pm-eyebrow">The services</p>
            <h2 id="all-services" className="pm-h2 mt-5">
              What we <span className="pm-serif">run</span> for you.
            </h2>
          </div>
          <p className="pm-lede max-w-md lg:justify-self-end">Each service has a clear job in the funnel, listed in the order a visitor meets them.</p>
        </div>
        <ul className="mt-14 grid gap-4 lg:grid-cols-6">
          {services.map((s, i) => (
            <li key={s.slug} className={spans[i] ?? "lg:col-span-2"}>
              <Link
                href={`/services/${s.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-hair bg-white transition-shadow hover:shadow-[0_24px_48px_-24px_rgb(10_13_20/0.22)]"
              >
                <div aria-hidden="true" className="flex h-52 items-center justify-center bg-[radial-gradient(120%_90%_at_50%_0%,#fbfbfa,#f3f3f0)] px-6">
                  <ServiceMini slug={s.slug} />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="pm-h3">{s.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-fg-2">{s.tagline}</p>
                  <p className="mt-4 text-[14px] leading-relaxed text-fg-2">
                    <span className="font-medium text-fg">Solves: </span>
                    {serviceIndexLedger[s.slug].problem}
                  </p>
                  <span className="mt-auto flex items-center gap-1.5 pt-6 text-[14.5px] font-medium text-brand">
                    Learn more
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-[12.5px] text-fg-3">Previews are illustrative sample screens, not client data.</p>
      </Section>

      {/* 3. How they connect */}
      <Section id="system-title">
        <div className="mx-auto max-w-2xl text-center">
          <p className="pm-eyebrow">How they connect</p>
          <h2 id="system-title" className="pm-h2 mt-5">
            One funnel, <span className="pm-serif">five jobs.</span>
          </h2>
          <p className="pm-lede mt-5">Fixing one stage helps. Fixing them in order, with tracking you trust, is what makes the whole thing improve month after month.</p>
        </div>
        <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {growthSystem.map((stage, i) => {
            const last = i === growthSystem.length - 1;
            return (
              <li key={stage.key} className={cn("flex flex-col rounded-[24px] p-7", last ? "bg-fg text-white" : "bg-soft")}>
                <div className="flex items-center justify-between">
                  <span className={cn("grid size-9 place-items-center rounded-full text-[14px] font-medium", last ? "bg-white text-fg" : "bg-fg text-white")}>{i + 1}</span>
                  <span className={cn("font-mono text-[11px] tracking-wide uppercase", last ? "text-[#7fb2ff]" : "text-fg-3")}>{stage.label}</span>
                </div>
                <h3 className="mt-7 text-[18px] font-semibold tracking-[-0.02em]">{stage.channels}</h3>
                <p className={cn("mt-2.5 text-[14.5px] leading-relaxed", last ? "text-white/70" : "text-fg-2")}>{stage.body}</p>
              </li>
            );
          })}
        </ol>
      </Section>

      {/* 4. Scope */}
      <Section id="scope-title" tone="line">
        <SectionHead
          id="scope-title"
          eyebrow="Who does what"
          title={
            <>
              Clear roles from <span className="pm-serif">day one.</span>
            </>
          }
          lede="Clear scope up front saves awkward conversations later, so here is exactly what we handle and what we need from you."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-[24px] bg-fg p-8 text-white">
            <h3 className="text-[17px] font-semibold tracking-[-0.02em]">We handle</h3>
            <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {serviceScope.weHandle.map((x) => (
                <li key={x} className="flex items-start gap-2.5 text-[15px] text-white/85">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#7fb2ff]" strokeWidth={2.5} aria-hidden="true" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[20px] bg-soft p-8">
              <h3 className="text-[17px] font-semibold tracking-[-0.02em]">You provide</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {serviceScope.clientProvides.map((x) => (
                  <li key={x} className="rounded-full bg-white px-3 py-1.5 text-[14px] text-fg-2">
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-start gap-2.5 text-[14px] leading-relaxed text-fg-2">
                <Package className="mt-0.5 size-4 shrink-0 text-[#b54708]" aria-hidden="true" />
                <span>
                  <span className="font-medium text-fg">Creative production is not included.</span> We work with the images, videos and brand assets you already have,
                  and we&rsquo;ll tell you when better assets would make a real difference to results.
                </span>
              </p>
            </div>
            <div className="pm-card p-8">
              <h3 className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
                <KeyRound className="size-4.5 text-brand" aria-hidden="true" />
                You own every account
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-fg-2">{clientOwnership.intro}</p>
            </div>
          </div>
        </div>
      </Section>

      <FooterCta />
    </>
  );
}
