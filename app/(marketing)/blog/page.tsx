import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FooterCta } from "@/components/sections/cta-bands";
import { Section } from "@/components/sections/primitives";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";
import { getBlogCategories, getPublishedPosts } from "@/lib/services/content";
import { cn } from "@/lib/utils/cn";
import { CategoryTab, PostCard, PostMeta, categoryDot, categoryMap } from "./blog-shared";

export const revalidate = 300;

export async function generateMetadata(props: PageProps<"/blog">) {
  const { category } = await props.searchParams;
  const slug = typeof category === "string" ? category : null;
  const categories = await getBlogCategories();
  const active = slug ? categories.find((c) => c.slug === slug) : undefined;
  return pageMetadata({
    title: active ? `${active.name} articles` : "Blog",
    description:
      active?.description ??
      "Practical articles on Meta Ads, Google Ads, landing pages, CRO and tracking, written for business owners who want paid traffic to turn into revenue.",
    path: "/blog",
  });
}

export default async function BlogIndexPage(props: PageProps<"/blog">) {
  const { category } = await props.searchParams;
  const activeSlug = typeof category === "string" ? category : null;

  const [posts, categories] = await Promise.all([getPublishedPosts(), getBlogCategories()]);
  const byId = categoryMap(categories);
  const active = activeSlug ? categories.find((c) => c.slug === activeSlug) : undefined;
  const filtered = active ? posts.filter((p) => p.category_id === active.id) : posts;
  const usedCategories = categories.filter((c) => posts.some((p) => p.category_id === c.id));

  const [featured, ...rest] = filtered;

  const filters = [{ key: "all", slug: "", name: "All articles", href: "/blog", current: !active }].concat(
    usedCategories.map((c) => ({ key: c.id, slug: c.slug, name: c.name, href: `/blog?category=${c.slug}`, current: active?.id === c.id })),
  );
  const featuredCat = featured?.category_id ? byId.get(featured.category_id) : undefined;

  return (
    <>
      <PageHero
        crumbs={active ? [{ name: "Blog", path: "/blog" }, { name: active.name, path: `/blog?category=${active.slug}` }] : [{ name: "Blog", path: "/blog" }]}
        eyebrow={`${filtered.length} ${filtered.length === 1 ? "article" : "articles"}`}
        title={active ? active.name : "Notes on paid acquisition that actually converts."}
        accent={active ? undefined : "actually converts."}
        lead={
          active?.description ??
          "Practical writing on Meta Ads, Google Ads, landing pages, CRO and tracking. No growth hacks. Just what we check, fix and measure in real accounts."
        }
      />

      {usedCategories.length > 0 && (
        <div className="border-b border-hair bg-white">
          <nav aria-label="Filter by category" className="pm-wrap py-5">
            <ul className="-mx-1 flex flex-wrap gap-2">
              {filters.map((f) => (
                <li key={f.key}>
                  <Link
                    href={f.href}
                    aria-current={f.current ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 items-center gap-2 rounded-full px-4 text-[14px] transition-colors",
                      f.current ? "bg-fg text-white" : "bg-soft text-fg-2 hover:bg-soft-2 hover:text-fg",
                    )}
                  >
                    {f.slug && <span aria-hidden="true" className={cn("size-2 rounded-full", categoryDot(f.slug))} />}
                    {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {activeSlug && !active && (
        <div className="pm-wrap">
          <p className="py-5 text-[15px] text-fg-2">We couldn&apos;t find that category, so here are all articles.</p>
        </div>
      )}

      {!featured ? (
        <Section labelledBy="empty-title">
          <div className="max-w-2xl rounded-[24px] bg-soft p-8 sm:p-10">
            <h2 id="empty-title" className="pm-h3 text-[26px]">
              Nothing here yet.
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-fg-2">
              {active ? "There are no articles in this category yet." : "We haven't published any articles yet."} In the meantime, the growth audit is the fastest way to get
              specific advice.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonLink href="/free-growth-audit" size="lg">
                Get a Free Growth Audit
              </ButtonLink>
              {active && (
                <Link href="/blog" className="pm-link">
                  All articles
                </Link>
              )}
            </div>
          </div>
        </Section>
      ) : (
        <Section labelledBy="latest-title" className="lg:py-20">
          <h2 id="latest-title" className="sr-only">
            {active ? `Articles on ${active.name}` : "Latest articles"}
          </h2>
          <article className="group relative grid overflow-hidden rounded-[28px] border border-hair bg-white lg:grid-cols-[1.5fr_1fr]">
            <div className="p-7 sm:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-medium text-brand">Latest</span>
                <CategoryTab category={featuredCat} />
              </div>
              <h3 className="mt-6 max-w-[24ch] text-[clamp(1.8rem,1.3rem+1.6vw,2.6rem)] leading-[1.08] font-semibold tracking-[-0.035em] text-balance">
                <Link href={`/blog/${featured.slug}`} className="after:absolute after:inset-0 group-hover:text-brand">
                  {featured.title}
                </Link>
              </h3>
              <p className="mt-5 max-w-[58ch] text-[16.5px] leading-relaxed text-fg-2">{featured.excerpt}</p>
              <PostMeta post={featured} category={featuredCat} className="mt-6" />
              <span aria-hidden="true" className="pm-btn pm-btn-dark mt-8 h-11 px-5 text-[14.5px]">
                Read article
                <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
            </div>
            <div aria-hidden="true" className="hidden bg-soft p-10 lg:flex lg:flex-col lg:justify-between">
              <span className="pm-eyebrow">{featuredCat?.name ?? "Article"}</span>
              <span className="text-[6rem] leading-[0.85] font-semibold tracking-[-0.06em]">
                {featured.reading_minutes}
                <span className="ml-2 text-[1rem] font-normal tracking-normal text-fg-3">min read</span>
              </span>
            </div>
          </article>

          {rest.length > 0 && (
            <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} category={post.category_id ? byId.get(post.category_id) : undefined} />
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      <FooterCta />
    </>
  );
}
