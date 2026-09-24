import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

const elsewhere = [
  { href: "/services", label: "Services", note: "Meta Ads, Google Ads, landing pages, CRO, tracking" },
  { href: "/pricing", label: "Pricing", note: "Three plans, ad spend paid directly to the platforms" },
  { href: "/blog", label: "Blog", note: "Practical notes on paid acquisition" },
  { href: "/free-growth-audit", label: "Free Growth Audit", note: "A written review of your funnel" },
];

/** §91 — shared 404 content, used by the root and marketing not-found files. */
export function NotFoundBody() {
  return (
    <div className="pm-wrap pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="max-w-2xl">
        <p className="pm-eyebrow">Error 404</p>
        <h1 className="pm-h1 mt-4 text-[clamp(2.4rem,1.2rem+3.6vw,4.2rem)]">
          Page <span className="pm-serif text-brand">not found.</span>
        </h1>
        <p className="pm-lede mt-6">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Probably a moved page or a typo in the link, nothing you did wrong.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
            Back to Home
          </ButtonLink>
          <ButtonLink href="/services" size="lg" variant="outline">
            View Services
          </ButtonLink>
        </div>
      </div>

      <nav aria-labelledby="nf-elsewhere" className="mt-16 sm:mt-20">
        <h2 id="nf-elsewhere" className="pm-eyebrow">
          Or try one of these
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {elsewhere.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="group flex h-full flex-col rounded-[20px] border border-hair bg-white p-6 transition-shadow hover:shadow-[0_24px_48px_-24px_rgb(10_13_20/0.22)]">
                <span className="flex items-center justify-between gap-3 text-[16px] font-semibold tracking-[-0.015em] group-hover:text-brand">
                  {item.label}
                  <ArrowRight className="size-4 text-fg-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden="true" />
                </span>
                <span className="mt-2 text-[14px] leading-relaxed text-fg-2">{item.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
