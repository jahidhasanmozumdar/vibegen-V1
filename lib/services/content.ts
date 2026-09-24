import "server-only";

import { cache } from "react";

import { defaultIndustries } from "@/lib/content/industries";
import { defaultPricingPlans } from "@/lib/content/pricing";
import { defaultServices } from "@/lib/content/services";
import { publicStore } from "@/lib/data";
import type {
  BlogCategory,
  BlogPost,
  CaseStudy,
  Industry,
  IndustrySlug,
  PricingPlan,
  Service,
  ServiceSlug,
  Testimonial,
} from "@/lib/data/types";

/**
 * Read-only fetchers for the public site. Every function only returns
 * published/active content and falls back to the bundled starter content if
 * the database is unreachable, so marketing pages never hard-fail.
 */

const EPOCH = "1970-01-01T00:00:00.000Z";

function withFallbackMeta<T extends object>(row: T, index: number): T & { id: string; created_at: string; updated_at: string } {
  return { id: `fallback-${index}`, created_at: EPOCH, updated_at: EPOCH, ...row };
}

async function safe<T>(label: string, fn: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[content] ${label} failed, using fallback`, error instanceof Error ? error.message : error);
    return fallback();
  }
}

export const getServices = cache(async (): Promise<Service[]> =>
  safe(
    "services",
    async () => {
      const store = await publicStore();
      const rows = await store.list("services", { where: { status: "published" }, orderBy: { column: "sort_order" } });
      return rows.length ? rows : defaultServices.map(withFallbackMeta);
    },
    () => defaultServices.map(withFallbackMeta),
  ),
);

export async function getService(slug: string): Promise<Service | null> {
  const services = await getServices();
  return services.find((s) => s.slug === (slug as ServiceSlug)) ?? null;
}

export const getIndustries = cache(async (): Promise<Industry[]> =>
  safe(
    "industries",
    async () => {
      const store = await publicStore();
      const rows = await store.list("industries", { where: { status: "published" }, orderBy: { column: "sort_order" } });
      return rows.length ? rows : defaultIndustries.map(withFallbackMeta);
    },
    () => defaultIndustries.map(withFallbackMeta),
  ),
);

export async function getIndustry(slug: string): Promise<Industry | null> {
  const industries = await getIndustries();
  return industries.find((i) => i.slug === (slug as IndustrySlug)) ?? null;
}

export const getPricingPlans = cache(async (): Promise<PricingPlan[]> =>
  safe(
    "pricing",
    async () => {
      const store = await publicStore();
      const rows = await store.list("pricing_plans", { where: { active: true }, orderBy: { column: "sort_order" } });
      return rows.length ? rows : defaultPricingPlans.map(withFallbackMeta);
    },
    () => defaultPricingPlans.map(withFallbackMeta),
  ),
);

function isLive(post: Pick<BlogPost, "status" | "published_at">, now = Date.now()): boolean {
  if (post.status === "published") return true;
  if (post.status === "scheduled" && post.published_at) return new Date(post.published_at).getTime() <= now;
  return false;
}

export const getPublishedPosts = cache(async (): Promise<BlogPost[]> =>
  safe(
    "blog",
    async () => {
      const store = await publicStore();
      const rows = await store.list("blog_posts", { orderBy: { column: "published_at", ascending: false } });
      return rows.filter((p) => isLive(p));
    },
    () => [],
  ),
);

export async function getPost(slug: string): Promise<BlogPost | null> {
  const posts = await getPublishedPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export const getBlogCategories = cache(async (): Promise<BlogCategory[]> =>
  safe(
    "blog categories",
    async () => {
      const store = await publicStore();
      return store.list("blog_categories", { orderBy: { column: "name" } });
    },
    () => [],
  ),
);

export const getCaseStudies = cache(async (): Promise<CaseStudy[]> =>
  safe(
    "case studies",
    async () => {
      const store = await publicStore();
      const rows = await store.list("case_studies", { where: { status: "published" }, orderBy: { column: "published_at", ascending: false } });
      // Real case studies always sort ahead of illustrative ones.
      return rows.sort((a, b) => Number(a.is_demo) - Number(b.is_demo));
    },
    () => [],
  ),
);

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  const studies = await getCaseStudies();
  return studies.find((c) => c.slug === slug) ?? null;
}

export const getPublishedTestimonials = cache(async (): Promise<Testimonial[]> =>
  safe(
    "testimonials",
    async () => {
      const store = await publicStore();
      return store.list("testimonials", { where: { status: "published" }, orderBy: { column: "created_at", ascending: false } });
    },
    () => [],
  ),
);

export async function getTestimonial(id: string | null): Promise<Testimonial | null> {
  if (!id) return null;
  const all = await getPublishedTestimonials();
  return all.find((t) => t.id === id) ?? null;
}
