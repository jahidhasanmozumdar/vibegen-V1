import Link from "next/link";
import { BarChart3, Clock, KeyRound, LayoutTemplate, MousePointerClick, ShieldCheck, Target } from "lucide-react";

import { GrowthAuditForm } from "@/components/forms/growth-audit-form";
import { FormCanvas, SideCard, TrustChips } from "@/components/sections/form-canvas";
import { NumberedSteps } from "@/components/sections/primitives";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Get a Free Growth Audit",
  description:
    "A practical review of your paid acquisition: Meta and Google Ads, landing pages, conversion and tracking. Prioritized findings, reply within two business days, no obligation.",
  path: "/free-growth-audit",
});

const coverage: { icon: typeof Target; label: string; body: string }[] = [
  { icon: Target, label: "Acquisition", body: "Campaign structure, targeting, and where spend leaks into the wrong searches or audiences." },
  { icon: LayoutTemplate, label: "Landing page", body: "Does the page keep the ad's promise, load fast on mobile and make the next step obvious?" },
  { icon: MousePointerClick, label: "Conversion", body: "Friction, trust gaps and form issues that stop interested visitors from enquiring." },
  { icon: BarChart3, label: "Tracking", body: "Whether GA4, GTM, the Meta Pixel and conversion events record what you think they do." },
];

const nextSteps = [
  { title: "A person reviews your request", body: "We check your site and what you've told us about your ads." },
  { title: "Written reply within 2 business days", body: "First observations, prioritized, and what we'd look at next." },
  { title: "You decide what's next", body: "Use the findings yourself, or talk to us about fixing them." },
];

export default function FreeGrowthAuditPage() {
  return (
    <FormCanvas
      id="audit-title"
      crumbs={[{ name: "Free Growth Audit", path: "/free-growth-audit" }]}
      eyebrow="Free · No obligation · Written reply"
      title={
        <>
          Get a Free <span className="pm-serif text-brand">Growth Audit</span>
        </>
      }
      lead={
        <p>
          Tell us about your business and your ads. We&apos;ll review acquisition, landing pages, conversion and tracking, then tell you plainly where the funnel is
          leaking and what we&apos;d fix first.
        </p>
      }
      intro={
        <TrustChips
          items={[
            { icon: <Clock aria-hidden="true" />, text: "About 2 minutes" },
            { icon: <KeyRound aria-hidden="true" />, text: "No passwords needed" },
            { icon: <ShieldCheck aria-hidden="true" />, text: "Used only for your audit" },
          ]}
        />
      }
      aside={
        <>
          <SideCard id="next-title" title="What happens next" eyebrow="After you send it" tone="dark">
            <NumberedSteps steps={nextSteps} tone="dark" />
          </SideCard>

          <SideCard id="covers-title" title="What you get">
            <p className="text-[14.5px] leading-relaxed text-fg-2">A written, prioritized review of the four places paid traffic usually leaks:</p>
            <ul className="mt-5 divide-y divide-hair">
              {coverage.map(({ icon: Icon, label, body }) => (
                <li key={label} className="flex gap-3.5 py-3.5 first:pt-0 last:pb-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] leading-snug font-medium">{label}</p>
                    <p className="mt-0.5 text-[14px] leading-relaxed text-fg-2">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SideCard>

          <p className="px-1 text-[13.5px] leading-relaxed text-fg-3">
            If a deeper look would help, we may later ask for read-only access to your ad accounts or GA4. You choose whether to grant it and can remove it any time.
            Details are in our{" "}
            <Link href="/privacy" className="pm-link">
              privacy policy
            </Link>
            . Prefer to talk first?{" "}
            <Link href="/book-a-call" className="pm-link">
              Book a Strategy Call
            </Link>
            .
          </p>
        </>
      }
    >
      <GrowthAuditForm />
    </FormCanvas>
  );
}
