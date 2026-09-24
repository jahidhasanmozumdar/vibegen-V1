import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config/site";
import { getCaseStudies, getIndustries, getPublishedPosts, getServices } from "@/lib/services/content";

export const revalidate = 3600;

const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/free-growth-audit", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/book-a-call", priority: 0.8, changeFrequency: "monthly" },
  { path: "/industries", priority: 0.7, changeFrequency: "monthly" },
  { path: "/case-studies", priority: 0.7, changeFrequency: "weekly" },
  { path: "/process", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/resources", priority: 0.6, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookie-policy", priority: 0.2, changeFrequency: "yearly" },
];

const EPOCH = "1970-01-01T00:00:00.000Z";

/** Only use a real timestamp; fallback content carries the epoch. */
function lastModified(...dates: (string | null | undefined)[]): Date | undefined {
  const valid = dates.filter((d): d is string => Boolean(d) && d !== EPOCH);
  if (!valid.length) return undefined;
  return new Date(Math.max(...valid.map((d) => new Date(d).getTime())));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const [services, industries, posts, studies] = await Promise.all([getServices(), getIndustries(), getPublishedPosts(), getCaseStudies()]);

  return [
    ...staticRoutes.map((r) => ({ url: `${base}${r.path === "/" ? "" : r.path}`, changeFrequency: r.changeFrequency, priority: r.priority })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: lastModified(s.updated_at), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...industries.map((i) => ({ url: `${base}/industries/${i.slug}`, lastModified: lastModified(i.updated_at), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...posts
      .filter((p) => !p.noindex)
      .map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: lastModified(p.updated_at, p.published_at), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...studies
      .filter((c) => !c.noindex)
      .map((c) => ({ url: `${base}/case-studies/${c.slug}`, lastModified: lastModified(c.updated_at, c.published_at), changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
