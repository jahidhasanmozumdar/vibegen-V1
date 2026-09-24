import Link from "next/link";
import { ArrowRight, Clock, Mail } from "lucide-react";

import { ContactForm } from "@/components/forms/contact-form";
import { FormCanvas, SideCard, StepChips, TrustChips } from "@/components/sections/form-canvas";
import { NumberedSteps } from "@/components/sections/primitives";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSiteSettings } from "@/lib/services/settings";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Questions about Meta Ads, Google Ads, landing pages, CRO or tracking? Send us a message and we'll reply within one business day.",
  path: "/contact",
});

const nextSteps = [
  { title: "A person reads your message", body: "No auto-responder sequence." },
  { title: "We reply within one business day", body: "Usually with a straight answer or a couple of questions." },
  { title: "If a call makes sense, we'll suggest one", body: "If it doesn't, we'll say so." },
];

const shortcuts = [
  { href: "/free-growth-audit", title: "Get a Free Growth Audit", body: "A practical, written review of your ads, landing pages and tracking." },
  { href: "/book-a-call", title: "Book a Strategy Call", body: "30 minutes on your acquisition and next steps." },
];

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const email = settings.contact_email;

  return (
    <FormCanvas
      id="contact-title"
      crumbs={[{ name: "Contact", path: "/contact" }]}
      eyebrow="Questions, ideas, projects"
      title={
        <>
          Talk to us about your <span className="pm-serif text-brand">acquisition.</span>
        </>
      }
      lead={
        <p>
          Ask a question, sense-check an idea or tell us about a project. If you want a structured review of your ads and funnel, the growth audit is usually the better
          starting point.
        </p>
      }
      intro={
        <TrustChips
          items={[
            { icon: <Clock aria-hidden="true" />, text: "Reply within one business day" },
            ...(email
              ? [
                  {
                    icon: <Mail aria-hidden="true" />,
                    text: (
                      <a href={`mailto:${email}`} className="font-medium text-fg hover:text-brand">
                        {email}
                      </a>
                    ),
                  },
                ]
              : []),
          ]}
        />
      }
      cardTitle="Send a message"
      cardMeta={<StepChips steps={["Details", "Business", "Message"]} />}
      aside={
        <>
          <SideCard id="contact-next" title="What happens next" eyebrow="After you send it" tone="dark">
            <NumberedSteps steps={nextSteps} tone="dark" />
            <p className="mt-6 border-t border-white/10 pt-4 text-[13.5px] leading-relaxed text-white/55">
              We work with businesses in the US and UK, so replies may arrive in your morning.
            </p>
          </SideCard>

          <nav aria-labelledby="contact-shortcuts" className="rounded-[24px] border border-hair bg-white p-7">
            <h2 id="contact-shortcuts" className="text-[19px] leading-tight font-semibold tracking-[-0.02em]">
              Looking for something specific?
            </h2>
            <ul className="mt-4 divide-y divide-hair">
              {shortcuts.map(({ href, title, body }) => (
                <li key={href}>
                  <Link href={href} className="group flex items-center gap-4 py-4 last:pb-0">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium group-hover:text-brand">{title}</span>
                      <span className="mt-0.5 block text-[14px] leading-snug text-fg-2">{body}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-fg-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      }
    >
      <ContactForm />
    </FormCanvas>
  );
}
