import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Breadcrumbs } from "@/components/pages/common/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";
import { getBlogCategories, getPublishedPosts } from "@/lib/services/content";
import { AuditConversion } from "./audit-conversion";

export const metadata = pageMetadata({
  title: "Audit request received",
  description: "Your growth audit request is in. Here's what happens next.",
  path: "/free-growth-audit/thank-you",
  noindex: true,
});

const steps: { when: string; title: string; body: string }[] = [
  { when: "Today", title: "A person reads it", body: "Your request lands with us and a person reads it. You don't need to do anything else." },
  { when: "Within 2 business days", title: "Written reply", body: "We reply by email with first observations on your acquisition, landing page, conversion and tracking." },
  { when: "If it helps", title: "Go deeper, optionally", body: "We may ask for read-only access to go deeper, or suggest a short call to walk through what we found. Both are optional." },
];

function cleanRef(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const clean = raw.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 16);
  return clean || null;
}

export default async function AuditThankYouPage(props: PageProps<"/free-growth-audit/thank-you">) {
  const searchParams = await props.searchParams;
  const reference = cleanRef(searchParams.ref);
  const [posts, categories] = await Promise.all([getPublishedPosts(), getBlogCategories()]);
  const guides = posts.slice(0, 3);
  const catById = new Map(categories.map((c) => [c.id, c]));

  return (
    <>
      <AuditConversion reference={reference} />

      <section aria-labelledby="ty-title" className="border-b border-hair bg-soft pt-10 pb-20 sm:pt-14 lg:pb-24">
        <div className="pm-wrap">
          <Breadcrumbs
            crumbs={[
              { name: "Free Growth Audit", path: "/free-growth-audit" },
              { name: "Request received", path: "/free-growth-audit/thank-you" },
            ]}
          />

          <div className="mx-auto mt-14 max-w-3xl text-center sm:mt-20">
            <span aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-full bg-[#e7f6ec] text-[#12a150]">
              <svg viewBox="0 0 24 24" className="size-7" fill="none">
                <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="pm-eyebrow mt-7">Request received</p>
            <h1 id="ty-title" className="pm-h1 mt-4 text-[clamp(2.4rem,1.2rem+3.6vw,4.2rem)]">
              Your audit request <span className="pm-serif text-brand">is in.</span>
            </h1>
            <p className="pm-lede mx-auto mt-6 max-w-2xl">
              Thanks for the detail. We&apos;ll review your site and what you&apos;ve told us about your ads, then reply by email within two business days.
            </p>
            {reference && (
              <dl className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-[inset_0_0_0_1px_#e8e8ec]">
                <dt className="text-[13px] text-fg-3">Reference</dt>
                <dd className="font-mono text-[14px] font-medium tracking-wide">{reference}</dd>
              </dl>
            )}
          </div>

          <div className="mt-16 sm:mt-20">
            <h2 className="pm-eyebrow text-center">What happens next</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.when} className="rounded-[24px] bg-white p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-fg text-[14px] font-medium text-white">{i + 1}</span>
                    <span className="rounded-full bg-soft px-3 py-1 text-[12.5px] text-fg-2">{s.when}</span>
                  </div>
                  <h3 className="mt-6 text-[18px] font-semibold tracking-[-0.02em]">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-fg-2">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="talk-title" className="py-20 lg:py-28">
        <div className="pm-wrap grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
          <aside aria-labelledby="talk-title" className="flex flex-col self-start rounded-[28px] bg-fg p-8 text-white sm:p-10">
            <p className="font-mono text-[12px] tracking-wide text-white/50 uppercase">Optional</p>
            <h2 id="talk-title" className="mt-4 text-[30px] leading-tight font-semibold tracking-[-0.035em]">
              Want to talk it <span className="pm-serif text-[#7fb2ff]">through?</span>
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-white/65">
              A 30-minute strategy call is the fastest way to go from findings to a plan. It&apos;s optional, and it works best once you&apos;ve seen the audit.
            </p>
            <div className="mt-auto pt-8">
              <ButtonLink href="/book-a-call" size="lg" variant="inverse" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
                Book a Strategy Call
              </ButtonLink>
            </div>
          </aside>

          {guides.length > 0 && (
            <div>
              <p className="pm-eyebrow">While you wait</p>
              <h2 className="pm-h3 mt-4 text-[26px]">A few practical reads.</h2>
              <p className="mt-3 max-w-xl text-[15.5px] text-fg-2">On the same things we&apos;ll be looking at in your account.</p>
              <ul className="mt-7 divide-y divide-hair border-y border-hair">
                {guides.map((post) => {
                  const cat = post.category_id ? catById.get(post.category_id) : undefined;
                  return (
                    <li key={post.id}>
                      <Link href={`/blog/${post.slug}`} className="group flex items-center gap-4 py-5">
                        <span className="min-w-0 flex-1">
                          {cat && <span className="text-[12.5px] font-medium text-brand">{cat.name}</span>}
                          <span className="mt-1 block text-[17px] leading-snug font-medium tracking-[-0.015em] group-hover:text-brand">{post.title}</span>
                          <span className="mt-1 block text-[13.5px] text-fg-3">{post.reading_minutes} min read</span>
                        </span>
                        <ArrowRight className="size-4.5 shrink-0 text-fg-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
