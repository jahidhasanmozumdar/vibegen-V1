import { publicEnv } from "./env";

export const siteConfig = {
  name: "VibeGen",
  shortName: "VibeGen",
  url: publicEnv.siteUrl,
  tagline: "Performance marketing & conversion",
  description:
    "VibeGen builds and manages conversion-focused acquisition systems for startups and growing businesses in the US and UK — Meta Ads, Google Ads, landing pages, CRO and reliable analytics.",
  markets: ["United States", "United Kingdom"],
  foundedYear: 2026,
  // Only verified contact details are displayed. Leave empty to hide.
  contactEmail: publicEnv.contactEmail,
  bookingUrl: publicEnv.bookingUrl,
  social: [
    { label: "LinkedIn", href: publicEnv.linkedinUrl },
    { label: "X", href: publicEnv.xUrl },
  ].filter((s) => s.href),
} as const;

/** The two CTAs used across the whole site. Nothing else competes with them. */
export const cta = {
  primary: { label: "Get a Free Growth Audit", href: "/free-growth-audit" },
  secondary: { label: "Book a Strategy Call", href: "/book-a-call" },
} as const;

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup extends NavItem {
  children?: NavItem[];
}

export const serviceNav: NavItem[] = [
  { label: "Meta Ads", href: "/services/meta-ads", description: "Prospecting and retargeting on Facebook & Instagram" },
  { label: "Google Ads", href: "/services/google-ads", description: "Search campaigns built around buying intent" },
  { label: "Landing Pages", href: "/services/landing-pages", description: "Campaign pages designed to convert paid clicks" },
  { label: "CRO", href: "/services/cro", description: "Find and fix what stops visitors converting" },
  { label: "Analytics & Tracking", href: "/services/analytics", description: "GA4, GTM, Pixel and conversion tracking you can trust" },
];

export const industryNav: NavItem[] = [
  { label: "SaaS", href: "/industries/saas", description: "Demos, trials and qualified pipeline" },
  { label: "Home Services", href: "/industries/home-services", description: "Calls and quote requests in your service area" },
  { label: "Professional Services", href: "/industries/professional-services", description: "Consultations with the right buyers" },
  { label: "E-commerce", href: "/industries/ecommerce", description: "Profitable product acquisition and attribution" },
];

export const mainNav: NavGroup[] = [
  { label: "Services", href: "/services", children: serviceNav },
  { label: "Industries", href: "/industries", children: industryNav },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
];

export const footerNav: { title: string; links: NavItem[] }[] = [
  { title: "Services", links: serviceNav.map(({ label, href }) => ({ label, href })) },
  { title: "Industries", links: industryNav.map(({ label, href }) => ({ label, href })) },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Process", href: "/process" },
      { label: "Pricing", href: "/pricing" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Guides", href: "/resources" },
      { label: "Free Growth Audit", href: "/free-growth-audit" },
      { label: "Book a Strategy Call", href: "/book-a-call" },
    ],
  },
];

export const legalNav: NavItem[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookie Policy", href: "/cookie-policy" },
];
