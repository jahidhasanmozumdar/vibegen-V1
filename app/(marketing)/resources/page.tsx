import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CategoryTab, PostCard, categoryMap } from "@/app/(marketing)/blog/blog-shared";
import { SectionHead } from "@/components/home/section-head";
import { FinalCta } from "@/components/sections/cta-bands";
import { Section, Ticks } from "@/components/sections/primitives";
import { PageHero } from "@/components/site/page-hero";
import { pageMetadata } from "@/lib/seo/metadata";
import { getBlogCategories, getPublishedPosts } from "@/lib/services/content";
import { cn } from "@/lib/utils/cn";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Resources",
  description:
    "Guides, articles and practical checklists on Meta Ads, Google Ads, landing pages, CRO and conversion tracking, plus a free growth audit of your own funnel.",
  path: "/resources",
});

/**
 * Short checklists distilled from published articles, framed by the problem
 * they solve. Each links to the full post and only shows when that post is
 * live. No gated downloads.
 */
const checklists = [
  {
    slug: "ga4-gtm-conversion-tracking-checklist",
    problem: "Your conversion numbers don't match reality.",
    title: "Conversion tracking check",
    items: ["Track the real action, not just a thank-you page view", "Mark only real conversions as key events in GA4", "Submit every form and confirm it in GTM Preview and DebugView"],
  },
  {
    slug: "meta-ads-clicks-but-no-leads",
    problem: "Meta sends clicks, but no leads arrive.",
    title: "Clicks but no leads",
    items: ["Send a test lead and watch it arrive in Events Manager", "Put each ad next to its landing page and check the match", "Remove at least one form field you don't need"],
  },
  {
    slug: "google-ads-negative-keywords-audit",
    problem: "Google spends on searches that never buy.",
    title: "Negative keyword audit",
    items: ["Review the search terms report, not just your keywords", "Build shared negative lists and apply them across campaigns", "Watch impressions after big changes to catch over-blocking"],
  },
  {
    slug: "message-match-landing-pages",
    problem: "Visitors land and leave within seconds.",
    title: "Message match",
    items: ["The headline repeats or continues the ad's promise", "The offer is visible without scrolling on a phone", "There is one obvious next step"],
  },
  {
    slug: "utm-naming-conventions",
    problem: "You can't tell which campaign a lead came from.",
    title: "UTM naming",
    items: ["All lowercase, no spaces, no special characters", "Keep a shared sheet of allowed sources and mediums", "Log every tagged link so nobody types parameters by hand"],
  },
  {
    slug: "lead-quality-vs-cpl",
    problem: "Leads are cheap, but sales says they're poor.",
    title: "Lead quality",
    items: ["Write down what “qualified” means with your sales team", "Track cost per qualified lead, not just CPL", "Check how fast leads get a reply before blaming the campaign"],
  },
];

export default async function ResourcesPage() {
  const [posts, categories] = await Promise.all([getPublishedPosts(), getBlogCategories()]);
  const byId = categoryMap(categories);
  const liveSlugs = new Set(posts.map((p) => p.slug));

  const guides = [...posts].sort((a, b) => b.reading_minutes - a.reading_minutes).slice(0, 3);
  const guideIds = new Set(guides.map((g) => g.id));
  const latest = posts.filter((p) => !guideIds.has(p.id)).slice(0, 6);
  const liveChecklists = checklists.filter((c) => liveSlugs.has(c.slug));

  const jump = [
    ...(liveChecklists.length > 0 ? [{ label: "Checklists", href: "#checklists" }] : []),
    { label: "Guides", href: "#guides" },
    { label: "Articles", href: "#blog" },
    { label: "Growth audit", href: "#audit" },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ name: "Resources", path: "/resources" }]}
        eyebrow="Free to read · No email required"
        title="Practical material for fixing paid acquisition."
        accent="fixing"
        lead="Guides, articles and short checklists from the work we do in ad accounts, landing pages and tracking setups. Start with the problem you have; each one points to the fix."
      >
        <nav aria-label="On this page">
          <ul className="flex flex-wrap gap-2">
            {jump.map((j) => (
              <li key={j.href}>
                <a href={j.href} className="inline-flex h-10 items-center rounded-full bg-soft px-4 text-[14px] text-fg-2 transition-colors hover:bg-soft-2 hover:text-fg">
                  {j.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      {liveChecklists.length > 0 && (
        <Section id="checklists" labelledBy="checklists-title">
          <SectionHead
            id="checklists-title"
            eyebrow="Start with your problem"
            title={
              <>
                Find your problem. <span className="pm-serif">Check these three things.</span>
              </>
            }
            lede="The short version of what we check first. Each links to the full article."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveChecklists.map((c) => (
              <section key={c.slug} aria-labelledby={`cl-${c.slug}`} className="flex flex-col overflow-hidden rounded-[24px] border border-hair bg-white">
                <p className="border-b border-hair bg-soft px-7 py-4 text-[14.5px] leading-snug text-fg-2">
                  <span className="text-fg-3">Problem: </span>
                  {c.problem}
                </p>
                <div className="flex flex-1 flex-col p-7">
                  <h3 id={`cl-${c.slug}`} className="text-[18px] font-semibold tracking-[-0.02em]">
                    {c.title}
                  </h3>
                  <Ticks items={c.items} className="mt-4 mb-6" />
                  <Link href={`/blog/${c.slug}`} className="pm-link mt-auto inline-flex items-center gap-1.5 text-[14.5px]">
                    Read the full guide <ArrowRight className="size-4" aria-hidden="true" />
                    <span className="sr-only">: {c.title}</span>
                  </Link>
                </div>
              </section>
            ))}
          </div>
        </Section>
      )}

      <Section id="guides" labelledBy="guides-title" tone="soft">
        <SectionHead
          id="guides-title"
          eyebrow="Guides"
          title={
            <>
              Start here if you want to fix something <span className="pm-serif">properly.</span>
            </>
          }
          lede="Our longest, most detailed pieces."
        />
        {guides.length ? (
          <ol className="mt-12 grid gap-4 lg:grid-cols-3">
            {guides.map((post, i) => {
              const cat = post.category_id ? byId.get(post.category_id) : undefined;
              const first = i === 0;
              return (
                <li key={post.id}>
                  <article
                    className={cn(
                      "group relative flex h-full flex-col rounded-[24px] p-7 sm:p-8",
                      first ? "bg-fg text-white" : "border border-hair bg-white transition-shadow hover:shadow-[0_24px_48px_-24px_rgb(10_13_20/0.22)]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className={cn("font-mono text-[11.5px] tracking-wide uppercase", first ? "text-[#7fb2ff]" : "text-fg-3")}>
                        {first ? "Start here" : `Guide ${String(i + 1).padStart(2, "0")}`}
                      </span>
                      <span className={cn("text-[13px]", first ? "text-white/55" : "text-fg-3")}>{post.reading_minutes} min read</span>
                    </div>
                    {cat && !first ? <CategoryTab category={cat} className="mt-6" /> : null}
                    {cat && first ? <p className="mt-6 text-[13px] font-medium text-white/70">{cat.name}</p> : null}
                    <h3 className="mt-3 text-[22px] leading-[1.2] font-semibold tracking-[-0.03em] text-pretty">
                      <Link href={`/blog/${post.slug}`} className={cn("after:absolute after:inset-0", !first && "group-hover:text-brand")}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className={cn("mt-3 text-[15px] leading-relaxed", first ? "text-white/65" : "text-fg-2")}>{post.excerpt}</p>
                    <span aria-hidden="true" className={cn("mt-auto inline-flex items-center gap-1.5 pt-6 text-[14.5px] font-medium", first ? "text-white" : "text-fg")}>
                      Read the guide <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </span>
                  </article>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-10 text-[16px] text-fg-2">Nothing here yet. Guides will appear here as we publish them.</p>
        )}
      </Section>

      <Section id="blog" labelledBy="blog-title">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            id="blog-title"
            eyebrow="Latest articles"
            title={
              <>
                Shorter, practical posts on <span className="pm-serif">specific problems.</span>
              </>
            }
          />
          <Link href="/blog" className="pm-link inline-flex shrink-0 items-center gap-1.5">
            All articles <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        {latest.length ? (
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => (
              <li key={post.id}>
                <PostCard post={post} category={post.category_id ? byId.get(post.category_id) : undefined} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 text-[16px] text-fg-2">Nothing here yet.</p>
        )}
      </Section>

      <div id="audit" className="scroll-mt-16">
        <FinalCta />
      </div>
    </>
  );
}
