import { ArrowUpRight, Briefcase, Code2, Home, ShoppingBag } from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { defaultIndustries } from "@/lib/content/industries";

const icons: Record<string, LucideIcon> = {
  saas: Code2,
  "home-services": Home,
  "professional-services": Briefcase,
  ecommerce: ShoppingBag,
};

// What each industry is actually buying — one plain line.
const goals: Record<string, string> = {
  saas: "More demos and trials, not just signups",
  "home-services": "Calls and quote requests in your area",
  "professional-services": "Consultations with the right clients",
  ecommerce: "Profitable sales, tracked properly",
};

export function Industries() {
  const items = defaultIndustries.filter((i) => i.status === "published").sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section aria-labelledby="industries-title" className="border-t border-hair py-24 lg:py-28">
      <div className="pm-wrap">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="pm-eyebrow">Who we help</p>
            <h2 id="industries-title" className="pm-h2 mt-5">
              Built for businesses that <span className="pm-serif">sell with ads.</span>
            </h2>
          </div>
          <p className="pm-lede max-w-md lg:justify-self-end">Startups and growing businesses in the US and UK. Each funnel is different, so we plan around yours.</p>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((ind) => {
            const Icon = icons[ind.slug] ?? Briefcase;
            return (
              <li key={ind.slug}>
                <Link href={`/industries/${ind.slug}`} className="group pm-card flex h-full flex-col p-6 transition-shadow hover:shadow-[0_24px_48px_-24px_rgb(10_13_20/0.22)]">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-[12px] bg-soft">
                      <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <ArrowUpRight className="size-5 text-fg-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" aria-hidden="true" />
                  </div>
                  <h3 className="mt-8 text-[18px] font-semibold tracking-[-0.02em]">{ind.name}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-fg-2">{goals[ind.slug] ?? ind.headline}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
