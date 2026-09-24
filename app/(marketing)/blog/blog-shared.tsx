import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { BlogCategory, BlogPost } from "@/lib/data/types";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/** Blog category → the service page most relevant to it (§96 blog → service). */
export const categoryService: Record<string, { href: string; label: string }> = {
  "meta-ads": { href: "/services/meta-ads", label: "Meta Ads" },
  "google-ads": { href: "/services/google-ads", label: "Google Ads" },
  "landing-pages": { href: "/services/landing-pages", label: "Landing Pages" },
  cro: { href: "/services/cro", label: "CRO" },
  "analytics-tracking": { href: "/services/analytics", label: "Analytics & Tracking" },
  "paid-acquisition": { href: "/services", label: "our services" },
};

/** One quiet dot colour per category (flat, from the chart palette). */
const categoryDots: Record<string, string> = {
  "meta-ads": "bg-[#7a3eff]",
  "google-ads": "bg-brand",
  "landing-pages": "bg-[#ff7ab6]",
  cro: "bg-[#b54708]",
  "analytics-tracking": "bg-[#02b3aa]",
  "paid-acquisition": "bg-fg",
};

export function categoryDot(slug?: string): string {
  return (slug && categoryDots[slug]) || "bg-fg-3";
}

export function categoryMap(categories: BlogCategory[]): Map<string, BlogCategory> {
  return new Map(categories.map((c) => [c.id, c]));
}

export function PostMeta({ post, category, className }: { post: BlogPost; category?: BlogCategory; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-fg-3", className)}>
      <time dateTime={post.published_at ?? undefined} className="tabular-nums">
        {formatDate(post.published_at)}
      </time>
      {category && <span aria-hidden="true">·</span>}
      {category && <span>{category.name}</span>}
      <span aria-hidden="true">·</span>
      <span>{post.reading_minutes} min read</span>
    </p>
  );
}

/** Category label: coloured dot + name. */
export function CategoryTab({ category, className }: { category?: BlogCategory; className?: string }) {
  if (!category) return null;
  return (
    <span className={cn("inline-flex items-center gap-2 text-[13px] font-medium text-fg-2", className)}>
      <span aria-hidden="true" className={cn("size-2 rounded-full", categoryDot(category.slug))} />
      {category.name}
    </span>
  );
}

/** Post card: category, title, excerpt, meta. The whole card is one link. */
export function PostCard({ post, category, headingLevel = "h3" }: { post: BlogPost; category?: BlogCategory; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex h-full flex-col rounded-[20px] border border-hair bg-white p-7 transition-shadow duration-200 hover:shadow-[0_24px_48px_-24px_rgb(10_13_20/0.22)]">
      <div className="flex items-center justify-between gap-3">
        <CategoryTab category={category} />
        <span className="text-[13px] text-fg-3">{post.reading_minutes} min</span>
      </div>
      <Heading className="mt-5 text-[19px] leading-snug font-semibold tracking-[-0.02em] text-pretty">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:rounded-[20px] group-hover:text-brand">
          {post.title}
        </Link>
      </Heading>
      <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-fg-2">{post.excerpt}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <time dateTime={post.published_at ?? undefined} className="text-[13px] text-fg-3 tabular-nums">
          {formatDate(post.published_at)}
        </time>
        <span aria-hidden="true" className="inline-flex items-center gap-1 text-[14px] font-medium text-fg">
          Read <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
