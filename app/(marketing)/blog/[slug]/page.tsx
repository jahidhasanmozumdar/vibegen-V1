import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";

import { SectionHead } from "@/components/home/section-head";
import { Breadcrumbs } from "@/components/pages/common/breadcrumbs";
import { proseCalm } from "@/components/pages/common/prose";
import { FooterCta } from "@/components/sections/cta-bands";
import { Section } from "@/components/sections/primitives";
import { JsonLd, articleSchema } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getBlogCategories, getPost, getPublishedPosts } from "@/lib/services/content";
import { cn } from "@/lib/utils/cn";
import { formatLongDate } from "@/lib/utils/format";
import { Markdown, extractHeadings } from "@/lib/utils/markdown";
import { CategoryTab, PostCard, categoryMap, categoryService } from "../blog-shared";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    seo: post,
    type: "article",
    publishedTime: post.published_at,
    modifiedTime: post.updated_at,
  });
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [posts, categories] = await Promise.all([getPublishedPosts(), getBlogCategories()]);
  const byId = categoryMap(categories);
  const category = post.category_id ? byId.get(post.category_id) : undefined;
  const headings = extractHeadings(post.content);
  const related = posts.filter((p) => p.id !== post.id && category && p.category_id === category.id).slice(0, 3);
  const fallbackRelated = related.length ? related : posts.filter((p) => p.id !== post.id).slice(0, 3);
  const service = category ? categoryService[category.slug] : undefined;
  const updated = post.updated_at && post.published_at && new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() > 86_400_000;

  const crumbs = [
    { name: "Blog", path: "/blog" },
    ...(category ? [{ name: category.name, path: `/blog?category=${category.slug}` }] : []),
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={articleSchema({
          title: post.title,
          description: post.excerpt,
          path: `/blog/${post.slug}`,
          author: post.author,
          publishedAt: post.published_at,
          updatedAt: post.updated_at,
          image: post.og_image ?? post.featured_image,
        })}
      />

      <header className="border-b border-hair bg-white pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="pm-wrap">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-12 max-w-[52rem] sm:mt-16">
            {category && (
              <Link href={`/blog?category=${category.slug}`} className="inline-flex rounded-full bg-soft px-3 py-1.5 hover:bg-soft-2">
                <CategoryTab category={category} />
              </Link>
            )}
            <h1 className="pm-h1 mt-6 text-[clamp(2.2rem,1.3rem+3vw,3.8rem)]">{post.title}</h1>
            <p className="pm-lede mt-6 max-w-[60ch]">{post.excerpt}</p>
          </div>
          <dl className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-fg-3">
            <div className="flex items-center gap-2.5">
              <dt className="sr-only">Author</dt>
              <dd className="flex items-center gap-2.5 font-medium text-fg">
                <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-fg text-[12px] font-medium text-white">
                  {post.author.slice(0, 1).toUpperCase()}
                </span>
                {post.author}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt>Published</dt>
              <dd className="text-fg-2">
                <time dateTime={post.published_at ?? undefined}>{formatLongDate(post.published_at)}</time>
              </dd>
            </div>
            {updated && (
              <div className="flex gap-1.5">
                <dt>Updated</dt>
                <dd className="text-fg-2">
                  <time dateTime={post.updated_at}>{formatLongDate(post.updated_at)}</time>
                </dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="sr-only">Reading time</dt>
              <dd>{post.reading_minutes} min read</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="py-14 sm:py-20">
        <div className="pm-wrap grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,680px)_1fr]">
          <div className="min-w-0 lg:order-2">
            {headings.length > 1 && (
              <div className="lg:sticky lg:top-24">
                <details className="group rounded-[16px] bg-soft p-5 lg:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-medium [&::-webkit-details-marker]:hidden">
                    On this page
                    <Plus className="size-4 text-fg-3 transition-transform group-open:rotate-45 motion-reduce:transition-none" aria-hidden="true" />
                  </summary>
                  <ol className="mt-4 space-y-2.5 text-[14.5px]">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="text-fg-2 hover:text-brand">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </details>
                <nav aria-labelledby="toc-title" className="hidden border-l border-hair pl-6 lg:block">
                  <p id="toc-title" className="pm-eyebrow">
                    On this page
                  </p>
                  <ol className="mt-4 space-y-3 text-[14px] leading-snug">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="text-fg-2 hover:text-brand">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            )}
          </div>

          <div className="min-w-0 lg:order-1">
            <article className={cn(proseCalm, "[&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24")}>
              <Markdown source={post.content} />
            </article>

            {post.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-hair pt-6">
                <span className="mr-1 text-[13px] text-fg-3">Tagged</span>
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-soft px-3 py-1 text-[13px] text-fg-2">
                    {tag.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            )}

            <aside aria-labelledby="post-cta" className="mt-12 rounded-[28px] bg-fg p-8 text-white sm:p-10">
              <p className="font-mono text-[12px] tracking-wide text-white/50 uppercase">If this sounds familiar</p>
              <h2 id="post-cta" className="mt-4 text-[clamp(1.6rem,1.3rem+1vw,2.1rem)] leading-[1.1] font-semibold tracking-[-0.035em]">
                Find out where your funnel is <span className="pm-serif text-[#7fb2ff]">leaking.</span>
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-white/65">
                Get a practical audit covering acquisition, landing pages, conversion and tracking.
                {service && (
                  <>
                    {" "}
                    Or see how we handle{" "}
                    <Link href={service.href} className="font-medium text-white underline underline-offset-4">
                      {service.label}
                    </Link>
                    .
                  </>
                )}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href="/free-growth-audit" className="pm-btn bg-white text-fg hover:bg-white/90">
                  Get a Free Growth Audit
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                {service && (
                  <Link href={service.href} className="text-[15px] font-medium text-white/80 hover:text-white">
                    Learn More
                  </Link>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {fallbackRelated.length > 0 && (
        <Section labelledBy="related-title" tone="soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHead
              id="related-title"
              eyebrow="Keep reading"
              title={
                related.length ? (
                  <>
                    More on this <span className="pm-serif">topic.</span>
                  </>
                ) : (
                  <>
                    More practical <span className="pm-serif">notes.</span>
                  </>
                )
              }
            />
            <Link href="/blog" className="pm-link inline-flex shrink-0 items-center gap-1.5">
              All articles <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fallbackRelated.map((p) => (
              <li key={p.id}>
                <PostCard post={p} category={p.category_id ? byId.get(p.category_id) : undefined} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <FooterCta />
    </>
  );
}
