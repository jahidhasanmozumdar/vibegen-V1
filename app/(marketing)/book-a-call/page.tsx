import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";

import { BookingRequestForm } from "@/components/forms/booking-request-form";
import { SectionHead } from "@/components/home/section-head";
import { SideCard } from "@/components/sections/form-canvas";
import { Crosses, GlanceCard, NumberedSteps, Section, Ticks } from "@/components/sections/primitives";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSiteSettings } from "@/lib/services/settings";
import { BookingLink } from "./booking-link";

export const metadata = pageMetadata({
  title: "30-Minute Growth Strategy Call",
  description:
    "A focused 30-minute call about your acquisition, paid traffic, conversion issues and tracking, with clear next steps. Not a generic sales call.",
  path: "/book-a-call",
});

const agenda = [
  { title: "Current acquisition", body: "Where customers come from today and what each channel costs you.", time: "5 min" },
  { title: "Paid traffic", body: "How your Meta and Google campaigns are set up, and what they're optimizing for.", time: "5 min" },
  { title: "Conversion issues", body: "Where visitors drop off between the click and the enquiry or sale.", time: "5 min" },
  { title: "Tracking", body: "Whether the numbers you're making decisions on can be trusted.", time: "5 min" },
  { title: "Growth opportunities", body: "The two or three changes most likely to matter for your business.", time: "5 min" },
  { title: "Next steps", body: "What you could do yourself, and whether working together makes sense.", time: "5 min" },
];

const goodFit = [
  "You're spending on Meta or Google Ads, or about to start",
  "You get clicks but not enough leads or sales",
  "You're not sure your conversion tracking is right",
  "You want a second opinion before hiring an agency",
];

const notFit = ["Social media management", "A full website build", "Guaranteed numbers before we've seen your account"];

const prepare = [
  "Your website or main landing page",
  "Rough monthly ad spend and main platforms",
  "What a good lead or sale is worth to you",
  "The one thing you most want to fix",
];

const facts = [
  { term: "Length", value: "30 minutes" },
  { term: "Format", value: "Online video call" },
  { term: "Cost", value: "Free" },
];

const requestSteps = [
  { title: "Send your preferred times", body: "Include your time zone. Nothing is booked yet." },
  { title: "We email you within one business day", body: "To confirm a time that works, with a video link." },
  { title: "We talk for 30 minutes", body: "You leave with a clearer picture and next steps." },
];

const bookedSteps = [
  { title: "Pick a slot in the scheduler", body: "You get a calendar invite with a video link." },
  { title: "Tell us what to cover", body: "Add a note when you book so we can prepare." },
  { title: "We talk for 30 minutes", body: "You leave with a clearer picture and next steps." },
];

type EmbedProvider = "calendly" | "cal_com";

/** Only embed hosts we know render a scheduling UI; everything else gets a plain link. */
function embedProvider(url: string): { provider: EmbedProvider | "other"; valid: boolean } {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== "https:") return { provider: "other", valid: protocol === "http:" };
    const host = hostname.replace(/^www\./, "");
    if (host === "calendly.com") return { provider: "calendly", valid: true };
    if (host === "cal.com" || host === "app.cal.com") return { provider: "cal_com", valid: true };
    return { provider: "other", valid: true };
  } catch {
    return { provider: "other", valid: false };
  }
}

export default async function BookACallPage() {
  const settings = await getSiteSettings();
  const bookingUrl = settings.booking_url.trim();
  const booking = bookingUrl ? embedProvider(bookingUrl) : null;
  const hasBooking = Boolean(booking?.valid);
  const canEmbed = hasBooking && booking?.provider !== "other";

  return (
    <>
      <PageHero
        crumbs={[{ name: "Book a Strategy Call", path: "/book-a-call" }]}
        eyebrow="30 min · Online · Free"
        title="30-Minute Growth Strategy Call"
        accent="Growth Strategy"
        lead="This isn't a generic sales call. We'll look at how you acquire customers today, where paid traffic is being wasted, and what we'd fix first. You leave with a clearer picture, whether or not we work together."
        aside={
          <GlanceCard
            title="The call at a glance"
            rows={facts}
            footer="Not a sales call. If we're not the right fit, we'll tell you, and point you somewhere better."
          />
        }
      >
        {hasBooking ? (
          <BookingLink href={bookingUrl} provider={booking?.provider ?? "other"} />
        ) : (
          <ButtonLink href="#request" size="lg" iconRight={<ArrowDown className="size-4" aria-hidden="true" />}>
            Request a call
          </ButtonLink>
        )}
        <ButtonLink href="/free-growth-audit" size="lg" variant="outline">
          Or start with a free audit
        </ButtonLink>
      </PageHero>

      <Section id="agenda" labelledBy="agenda-title">
        <SectionHead
          id="agenda-title"
          eyebrow="Agenda"
          title={
            <>
              What we&apos;ll cover, <span className="pm-serif">in this order.</span>
            </>
          }
          lede="We keep to time. If something needs more than 30 minutes, we'll follow up in writing."
        />
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agenda.map((a, i) => (
            <li key={a.title} className={i === agenda.length - 1 ? "rounded-[24px] bg-fg p-7 text-white" : "rounded-[24px] bg-soft p-7"}>
              <div className="flex items-center justify-between">
                <span
                  aria-hidden="true"
                  className={i === agenda.length - 1 ? "grid size-9 place-items-center rounded-full bg-white text-[14px] font-medium text-fg" : "grid size-9 place-items-center rounded-full bg-fg text-[14px] font-medium text-white"}
                >
                  {i + 1}
                </span>
                <span className={i === agenda.length - 1 ? "rounded-full bg-white/10 px-3 py-1 text-[12.5px] text-white/75" : "rounded-full bg-white px-3 py-1 text-[12.5px] text-fg-2"}>
                  ~{a.time}
                </span>
              </div>
              <h3 className="mt-6 text-[18px] font-semibold tracking-[-0.02em]">{a.title}</h3>
              <p className={i === agenda.length - 1 ? "mt-2 text-[15px] leading-relaxed text-white/70" : "mt-2 text-[15px] leading-relaxed text-fg-2"}>{a.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="fit" labelledBy="fit-title" bordered>
        <SectionHead
          id="fit-title"
          eyebrow="Before the call"
          title={
            <>
              Who it&apos;s for, and <span className="pm-serif">what to bring.</span>
            </>
          }
          lede="Nothing formal. These make the 30 minutes more useful."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <div className="pm-card p-7 sm:p-8">
            <h3 className="text-[17px] font-semibold tracking-[-0.02em]">A good fit if&hellip;</h3>
            <Ticks items={goodFit} tone="green" className="mt-5" />
          </div>
          <div className="pm-card p-7 sm:p-8">
            <h3 className="text-[17px] font-semibold tracking-[-0.02em]">Probably not the right call for&hellip;</h3>
            <Crosses items={notFit} className="mt-5" />
            <p className="mt-5 border-t border-hair pt-4 text-[13.5px] leading-relaxed text-fg-3">We&apos;ll tell you, rather than take the call anyway.</p>
          </div>
          <div className="rounded-[20px] bg-soft p-7 sm:p-8">
            <h3 className="text-[17px] font-semibold tracking-[-0.02em]">What to prepare</h3>
            <Ticks items={prepare} className="mt-5" />
          </div>
        </div>
      </Section>

      <section id="request" aria-labelledby="booking-title" className="scroll-mt-20 bg-soft py-20 lg:py-28">
        <div className="pm-wrap grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-10">
          <div>
            <div className="space-y-6 lg:sticky lg:top-24">
              <SectionHead
                id="booking-title"
                eyebrow={hasBooking ? "Book" : "Request a call"}
                title={
                  hasBooking ? (
                    <>
                      Pick a time that <span className="pm-serif">suits you.</span>
                    </>
                  ) : (
                    <>
                      Tell us when <span className="pm-serif">suits you.</span>
                    </>
                  )
                }
                lede={
                  hasBooking
                    ? "Choose a slot in the scheduler. You'll get a calendar invite with a video link."
                    : "We don't have online booking set up yet, so there's no calendar to show. Send your preferred times and we'll email you to confirm one that works."
                }
              />
              <SideCard id="booking-next" title="What happens next" tone="dark">
                <NumberedSteps steps={hasBooking ? bookedSteps : requestSteps} tone="dark" />
              </SideCard>
              <div className="rounded-[24px] border border-hair bg-white p-6">
                <p className="text-[15px] font-medium">Not ready for a call?</p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-fg-2">Request the audit instead. We review your funnel and reply in writing within two business days.</p>
                <Link href="/free-growth-audit" className="pm-link mt-3 inline-flex items-center gap-1.5 text-[14.5px]">
                  Get a Free Growth Audit <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-[24px] border border-hair bg-white px-5 py-6 sm:px-8 sm:py-8">
            {hasBooking ? (
              <div className="space-y-4">
                {canEmbed && (
                  <iframe
                    src={bookingUrl}
                    title="Schedule a 30-minute growth strategy call"
                    loading="lazy"
                    className="h-[720px] w-full rounded-[14px] border border-hair bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <BookingLink href={bookingUrl} provider={booking?.provider ?? "other"} />
                  <p className="text-[14px] text-fg-3">{canEmbed ? "Scheduler not loading? Open it in a new tab." : "Opens our scheduling page in a new tab."}</p>
                </div>
              </div>
            ) : (
              <BookingRequestForm />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
