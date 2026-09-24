import type { NewRow } from "@/lib/data/types";

const CTA_LABEL = "Get a Free Growth Audit";
const CTA_HREF = "/free-growth-audit";

export const defaultPricingPlans: NewRow<"pricing_plans">[] = [
  {
    name: "Launch",
    slug: "launch",
    description:
      "For businesses starting paid acquisition or cleaning up a small account, who need Meta, Google, a landing page and tracking set up properly from the start.",
    monthly_price: 1250,
    setup_fee: 750,
    currency: "USD",
    ad_spend_range: "$2,500+/month",
    features: [
      "Meta Ads",
      "Google Ads",
      "2 active Meta campaigns",
      "Search campaign management",
      "Basic retargeting",
      "1 campaign landing page",
      "Basic CRO",
      "GA4",
      "GTM",
      "Meta Pixel",
      "Conversion tracking",
      "Monthly reporting",
    ],
    cta_label: CTA_LABEL,
    cta_href: CTA_HREF,
    badge: null,
    sort_order: 1,
    active: true,
  },
  {
    name: "Growth",
    slug: "growth",
    description:
      "For businesses already spending on ads that want a structured full-funnel system across Meta and Google, with ongoing landing page and conversion work.",
    monthly_price: 2250,
    setup_fee: 1250,
    currency: "USD",
    ad_spend_range: "$5,000–$15,000/month",
    features: [
      "Multiple Meta campaigns",
      "Prospecting",
      "Retargeting",
      "Google Search",
      "Advanced keyword management",
      "Landing page optimization/build",
      "CRO",
      "GA4",
      "GTM",
      "Meta tracking",
      "UTM tracking",
      "Funnel reporting",
      "Bi-weekly reporting",
      "Two strategy calls/month",
    ],
    cta_label: CTA_LABEL,
    cta_href: CTA_HREF,
    badge: "Recommended",
    sort_order: 2,
    active: true,
  },
  {
    name: "Performance",
    slug: "performance",
    description:
      "For established advertisers spending at scale who need full management of both platforms, advanced tracking and attribution, and weekly strategic input.",
    monthly_price: 3750,
    setup_fee: 1750,
    currency: "USD",
    ad_spend_range: "$15,000–$50,000+/month",
    features: [
      "Full Meta management",
      "Full Google management",
      "Advanced audience architecture",
      "Full-funnel campaigns",
      "Advanced CRO",
      "Up to two landing page builds/optimizations monthly",
      "GA4",
      "GTM",
      "Advanced conversion tracking",
      "CAPI where applicable",
      "CRM/offline conversion integrations where feasible",
      "Attribution analysis",
      "Custom reporting",
      "Weekly strategy call",
    ],
    cta_label: CTA_LABEL,
    cta_href: CTA_HREF,
    badge: null,
    sort_order: 3,
    active: true,
  },
];

export const pricingDisclaimer: {
  adSpend: string;
  noGuarantee: string;
  factors: string[];
} = {
  adSpend:
    "Ad spend is not included in our fees. You pay Meta and Google directly through your own ad accounts, so you always see exactly what is being spent.",
  noGuarantee:
    "We do not guarantee specific numbers of leads, sales, CPL or ROAS. Anyone who does is guessing. Results depend on factors we influence and factors we don't, and we will be straight with you about both.",
  factors: [
    "Your market and seasonality",
    "Your offer",
    "Competition in your space",
    "Ad budget",
    "Your website and landing pages",
    "Your pricing",
    "Your sales process",
    "Lead follow-up speed and quality",
    "Tracking accuracy",
    "Ad platform and algorithm changes",
  ],
};

export const serviceScope: {
  clientProvides: string[];
  weHandle: string[];
  note: string;
} = {
  clientProvides: [
    "Images",
    "Videos",
    "Brand assets",
    "Offer details",
    "Testimonials",
    "Product information",
    "Legal information",
  ],
  weHandle: [
    "Campaign strategy and structure",
    "Ad copy",
    "Audience and keyword research",
    "Campaign builds and ongoing management",
    "Budget allocation and optimization",
    "Creative testing using your assets",
    "Landing page copy, build and optimization (within plan scope)",
    "CRO research and recommendations",
    "Tracking setup: GA4, GTM, Meta Pixel and conversion events",
    "Reporting and strategy calls",
  ],
  note: "Creative production is not included in our core services. We work with the images, videos and brand assets you already have, and we will tell you when better assets would make a real difference to results.",
};

export const clientOwnership: {
  intro: string;
  assets: string[];
} = {
  intro:
    "You own your accounts and your data. We work inside accounts that belong to your business, with access you grant and can remove at any time. If we part ways, everything stays with you.",
  assets: [
    "Meta Business Manager",
    "Ad account",
    "Google Ads account",
    "GA4",
    "GTM",
    "Website",
    "Domain",
    "CRM",
  ],
};
