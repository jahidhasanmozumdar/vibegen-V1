import type { Metadata } from "next";

import { siteConfig } from "@/lib/config/site";
import type { SeoFields } from "@/lib/data/types";

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  /** Use the title as-is instead of appending the site name. */
  absoluteTitle?: boolean;
  seo?: Partial<SeoFields> | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  noindex?: boolean;
}

/** One place that turns page content + CMS SEO overrides into Next metadata. */
export function pageMetadata({ title, description, path, absoluteTitle, seo, type = "website", publishedTime, modifiedTime, noindex }: PageMetaInput): Metadata {
  const finalTitle = seo?.seo_title || title;
  const finalDescription = seo?.seo_description || description;
  const canonical = seo?.canonical_url || path;
  const ogTitle = seo?.og_title || finalTitle;
  const ogDescription = seo?.og_description || finalDescription;
  const images = seo?.og_image ? [{ url: seo.og_image }] : undefined;
  const hidden = noindex || seo?.noindex;

  return {
    title: absoluteTitle || seo?.seo_title ? { absolute: finalTitle } : finalTitle,
    description: finalDescription,
    alternates: { canonical },
    robots: hidden ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      title: ogTitle,
      description: ogDescription,
      url: `${siteConfig.url}${path}`,
      siteName: siteConfig.name,
      images,
      ...(type === "article" ? { publishedTime: publishedTime ?? undefined, modifiedTime: modifiedTime ?? undefined } : {}),
    },
    twitter: { card: "summary_large_image", title: ogTitle, description: ogDescription, images: images?.map((i) => i.url) },
  };
}
