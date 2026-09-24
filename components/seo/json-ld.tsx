import { siteConfig } from "@/lib/config/site";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue | undefined };

/** Renders structured data safely (escapes `<` so content can't break out of the script tag). */
export function JsonLd({ data }: { data: Record<string, JsonValue | undefined> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    description: siteConfig.description,
    areaServed: ["US", "GB"],
    ...(siteConfig.contactEmail ? { email: siteConfig.contactEmail } : {}),
    ...(siteConfig.social.length ? { sameAs: siteConfig.social.map((s) => s.href) } : {}),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function serviceSchema(input: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: `${siteConfig.url}${input.path}`,
    serviceType: input.name,
    provider: { "@id": `${siteConfig.url}/#organization` },
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "United Kingdom" },
    ],
  };
}

export function articleSchema(input: { title: string; description: string; path: string; author: string; publishedAt: string | null; updatedAt: string; image?: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: `${siteConfig.url}${input.path}`,
    mainEntityOfPage: `${siteConfig.url}${input.path}`,
    author: { "@type": "Organization", name: input.author },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    datePublished: input.publishedAt ?? undefined,
    dateModified: input.updatedAt,
    ...(input.image ? { image: input.image } : {}),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}
