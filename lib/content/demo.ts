/**
 * DEMO CMS CONTENT.
 * Everything in this file is illustrative sample content, flagged is_demo: true,
 * and removable via "Remove demo data". None of it describes a real client,
 * real campaign or real result.
 */
import type { NewRow, SeoFields } from "@/lib/data/types";

const seo = (seo_title: string, seo_description: string): SeoFields => ({
  seo_title,
  seo_description,
  canonical_url: null,
  og_title: null,
  og_description: null,
  og_image: null,
  noindex: false,
});

const ILLUSTRATIVE = "Illustrative";

export const demoCaseStudies: NewRow<"case_studies">[] = [
  {
    title: "Illustrative SaaS Acquisition Funnel",
    slug: "illustrative-saas-acquisition-funnel",
    client: "Demo SaaS company",
    industry: "saas",
    excerpt:
      "An illustrative example of how a B2B SaaS company might move from optimizing for cheap signups to optimizing for booked demos and qualified pipeline.",
    challenge:
      "In this hypothetical scenario, a B2B SaaS company runs Google and Meta campaigns optimized for free signups. Cost per signup looks healthy, but very few signups activate, and the sales team says most demo requests come from outside the target company size.\n\n" +
      "Tracking is split across the marketing site, the app and the CRM. Nobody can say which campaigns produce paying customers, so budget decisions are based on signup volume alone.",
    strategy:
      "The illustrative plan starts with measurement: define a qualified demo as the primary conversion, pass CRM stage changes back to Google and Meta where feasible, and standardize UTMs so every lead carries its source into the CRM.\n\n" +
      "Campaigns are then restructured by intent. High-intent search terms go to a dedicated demo page. Colder Meta audiences are offered a lower-commitment step, with retargeting to move engaged visitors toward a demo.",
    execution:
      "In this example, the team rebuilds GTM and GA4 events, sets up offline conversion imports, and consolidates the Google account around a smaller set of high-intent keyword themes with thorough negative keyword lists.\n\n" +
      "Two use-case landing pages are built with clear qualification cues, such as who the product is for and typical team size. The demo form adds one qualifying question to help sales prioritize.",
    results:
      "These results are illustrative only and do not describe a real client. In a scenario like this, you would typically expect fewer total signups but a higher share of qualified demos, and a clearer view of cost per qualified opportunity.\n\n" +
      "The main outcome in this hypothetical is decision quality: budget can be moved based on pipeline rather than signup volume. Real results depend on the product, market, sales process and tracking quality.",
    metrics: [
      { label: "Cost per qualified demo", before: "$640", after: "$410", note: ILLUSTRATIVE },
      { label: "Signup-to-demo rate", before: "3%", after: "7%", note: ILLUSTRATIVE },
      { label: "Leads with source data in CRM", before: "35%", after: "95%", note: ILLUSTRATIVE },
    ],
    services: ["google-ads", "meta-ads", "landing-pages", "analytics"],
    duration: "Illustrative 4-month scenario",
    ad_spend: "Illustrative $12,000/month",
    images: [],
    testimonial_id: null,
    status: "published",
    published_at: "2026-04-14T09:00:00.000Z",
    is_demo: true,
    ...seo(
      "Illustrative SaaS Acquisition Funnel (Demo) | VibeGen",
      "An illustrative, hypothetical example of restructuring SaaS paid acquisition around qualified demos. Demo content, not a real client."
    ),
  },
  {
    title: "Illustrative Local Service Lead Funnel",
    slug: "illustrative-local-service-lead-funnel",
    client: "Demo home services business",
    industry: "home-services",
    excerpt:
      "An illustrative example of a home services company tightening local targeting, tracking phone calls and matching landing pages to urgent and planned jobs.",
    challenge:
      "In this hypothetical, a roofing and repair business runs Google Search with broad keywords and sends every click to its homepage. Many searches are DIY or informational, and some clicks come from outside the service area.\n\n" +
      "Most customers phone rather than fill in a form, but calls are not tracked. As a result, Google Ads reports very few conversions and automated bidding has little to learn from.",
    strategy:
      "The illustrative plan separates urgent repair searches from planned replacement projects, since they have different intent, value and urgency. Location targeting is restricted to people in the service area.\n\n" +
      "Call tracking is added for ad calls and landing page calls, with a minimum call duration used to filter out very short calls.",
    execution:
      "In this example, the team builds two landing pages: one for emergency repairs with the phone number prominent, and one for replacement quotes with a short form and real reviews. Search term reviews add DIY and job-seeker negatives.\n\n" +
      "A light Meta retargeting campaign follows up with visitors to the replacement page, using the business's own project photos.",
    results:
      "These results are illustrative only and do not describe a real client. In a scenario like this, the expected change is fewer wasted clicks and a much clearer picture of which campaigns produce calls and quote requests.\n\n" +
      "The hypothetical business can now see cost per call and cost per quote separately. Actual results would depend on local competition, seasonality, pricing and how quickly calls are answered.",
    metrics: [
      { label: "Tracked conversions per month", before: "9", after: "58", note: ILLUSTRATIVE },
      { label: "Spend on irrelevant search terms", before: "28%", after: "9%", note: ILLUSTRATIVE },
      { label: "Cost per lead (calls + forms)", before: "$118", after: "$74", note: ILLUSTRATIVE },
    ],
    services: ["google-ads", "meta-ads", "landing-pages", "analytics"],
    duration: "Illustrative 3-month scenario",
    ad_spend: "Illustrative $4,500/month",
    images: [],
    testimonial_id: null,
    status: "published",
    published_at: "2026-05-19T09:00:00.000Z",
    is_demo: true,
    ...seo(
      "Illustrative Local Service Lead Funnel (Demo) | VibeGen",
      "An illustrative, hypothetical example of local lead generation with call tracking and intent-matched landing pages. Demo content, not a real client."
    ),
  },
  {
    title: "Illustrative E-commerce Conversion System",
    slug: "illustrative-ecommerce-conversion-system",
    client: "Demo DTC brand",
    industry: "ecommerce",
    excerpt:
      "An illustrative example of an online store aligning ROAS targets with margins, fixing purchase tracking and improving product page conversion.",
    challenge:
      "In this hypothetical, a DTC brand sees strong ROAS in Meta and Google, but revenue in the store does not match what the platforms report combined. Purchase events are duplicated in some cases, and retargeting takes a large share of budget.\n\n" +
      "Mobile product pages load slowly and shipping costs are only shown at checkout, where many visitors abandon.",
    strategy:
      "The illustrative plan starts by calculating break-even ROAS per product category from margin data. Purchase tracking is deduplicated across the Pixel, Conversions API and GA4.\n\n" +
      "Prospecting and retargeting budgets are rebalanced so retargeting doesn't take credit for sales that would have happened anyway. CRO focuses on the highest-traffic product pages.",
    execution:
      "In this example, the team fixes event deduplication, sets up the Conversions API with proper event IDs, and builds a simple report comparing platform-reported revenue with store revenue.\n\n" +
      "Product pages get clearer shipping information above the fold, compressed images and a simplified variant selector. Creative tests use the brand's existing product photos and customer videos.",
    results:
      "These results are illustrative only and do not describe a real client. In a scenario like this, reported ROAS often goes down after tracking is fixed, because double-counting is removed. That is a more honest number, not a worse business.\n\n" +
      "The hypothetical outcome is a clearer view of profitable spend by category and a better mobile conversion rate. Real results would depend on product, pricing, margins and competition.",
    metrics: [
      { label: "Platform vs store revenue gap", before: "+38%", after: "+8%", note: ILLUSTRATIVE },
      { label: "Mobile conversion rate", before: "1.1%", after: "1.6%", note: ILLUSTRATIVE },
      { label: "Share of budget on retargeting", before: "45%", after: "20%", note: ILLUSTRATIVE },
      { label: "Blended ROAS (store revenue)", before: "2.1x", after: "2.6x", note: ILLUSTRATIVE },
    ],
    services: ["meta-ads", "google-ads", "cro", "analytics"],
    duration: "Illustrative 5-month scenario",
    ad_spend: "Illustrative $25,000/month",
    images: [],
    testimonial_id: null,
    status: "published",
    published_at: "2026-06-23T09:00:00.000Z",
    is_demo: true,
    ...seo(
      "Illustrative E-commerce Conversion System (Demo) | VibeGen",
      "An illustrative, hypothetical example of fixing e-commerce tracking, aligning ROAS with margins and improving product page conversion. Demo content."
    ),
  },
  {
    title: "Illustrative Professional Services Consultation Funnel",
    slug: "illustrative-professional-services-consultation-funnel",
    client: "Demo consulting firm",
    industry: "professional-services",
    excerpt:
      "An illustrative example of a consulting firm trading a lower CPL for better-qualified consultation bookings.",
    challenge:
      "In this hypothetical, a consulting firm generates plenty of enquiries from Google and Meta, but partners spend hours on calls with prospects who are too small, looking for free advice, or outside the firm's specialty.\n\n" +
      "The landing page is generic, doesn't mention who the firm works with, and the form only asks for name and email.",
    strategy:
      "The illustrative plan accepts a higher cost per lead in exchange for better qualification. The page states clearly who the firm is for, gives a pricing signal, and adds two qualifying questions to the booking form.\n\n" +
      "Qualified and won leads are sent back to Google Ads as offline conversions, where feasible, so bidding learns what a good lead looks like.",
    execution:
      "In this example, the team rewrites the landing page around the firm's specific niche, adds real credentials and process details, and replaces the contact form with a booking flow that includes qualifying questions.\n\n" +
      "Search campaigns are narrowed to high-intent service terms. Meta is limited to retargeting and a lookalike audience built from past clients.",
    results:
      "These results are illustrative only and do not describe a real client. In a scenario like this, lead volume typically drops while the share of qualified consultations rises, freeing up partner time.\n\n" +
      "The hypothetical measure of success is cost per qualified consultation rather than cost per lead. Real results would depend on the firm's market, reputation and follow-up process.",
    metrics: [
      { label: "Cost per lead", before: "$85", after: "$140", note: ILLUSTRATIVE },
      { label: "Qualified consultation rate", before: "20%", after: "55%", note: ILLUSTRATIVE },
      { label: "Cost per qualified consultation", before: "$425", after: "$255", note: ILLUSTRATIVE },
    ],
    services: ["google-ads", "meta-ads", "landing-pages", "cro", "analytics"],
    duration: "Illustrative 3-month scenario",
    ad_spend: "Illustrative $6,000/month",
    images: [],
    testimonial_id: null,
    status: "published",
    published_at: "2026-07-28T09:00:00.000Z",
    is_demo: true,
    ...seo(
      "Illustrative Professional Services Consultation Funnel (Demo) | VibeGen",
      "An illustrative, hypothetical example of improving lead quality for a consulting firm. Demo content, not a real client."
    ),
  },
  {
    title: "Illustrative Tracking Rebuild for a Multi-Channel Account",
    slug: "illustrative-tracking-rebuild-multi-channel",
    client: "Demo multi-channel advertiser",
    industry: null,
    excerpt:
      "An illustrative example of rebuilding GA4, GTM, Pixel and Google Ads conversion tracking so budget decisions are based on data everyone trusts.",
    challenge:
      "In this hypothetical, a business advertising on Google and Meta has three different conversion numbers every month: one from Google Ads, one from Meta and one from GA4. None matches the CRM.\n\n" +
      "The GTM container has years of old tags, some conversions fire on page load, and UTMs are inconsistent across campaigns.",
    strategy:
      "The illustrative plan is to audit every tag, define a short list of conversion events that map to real business actions, and rebuild tracking from a clean baseline.\n\n" +
      "UTM naming conventions are standardized, source data is captured on every lead form, and the CRM becomes the reference point for lead counts.",
    execution:
      "In this example, the team removes unused tags, rebuilds GA4 events, sets up Google Ads conversions from GTM, and adds the Meta Conversions API with deduplication.\n\n" +
      "Hidden fields capture UTMs and click IDs on forms, and a simple dashboard reconciles platform-reported conversions with CRM leads each week.",
    results:
      "These results are illustrative only and do not describe a real client. In a scenario like this, platform-reported conversions often fall after the rebuild, because inflated and duplicate events are removed.\n\n" +
      "The hypothetical benefit is that platform and CRM numbers move much closer together, so budget decisions can be made with confidence. Some gap between sources is always normal.",
    metrics: [
      { label: "Active GTM tags", before: "64", after: "22", note: ILLUSTRATIVE },
      { label: "Platform vs CRM lead gap", before: "3.2x", after: "1.2x", note: ILLUSTRATIVE },
      { label: "Leads with UTM source captured", before: "40%", after: "92%", note: ILLUSTRATIVE },
    ],
    services: ["analytics", "google-ads", "meta-ads"],
    duration: "Illustrative 6-week scenario",
    ad_spend: "Illustrative $18,000/month",
    images: [],
    testimonial_id: null,
    status: "published",
    published_at: "2026-08-25T09:00:00.000Z",
    is_demo: true,
    ...seo(
      "Illustrative Tracking Rebuild for a Multi-Channel Account (Demo) | VibeGen",
      "An illustrative, hypothetical example of rebuilding GA4, GTM and conversion tracking across Google and Meta. Demo content, not a real client."
    ),
  },
];

export const demoTestimonials: NewRow<"testimonials">[] = [
  {
    name: "Demo Client",
    role: "Example role",
    company: "Demo Company",
    quote:
      "The first thing they did was tell us our conversion tracking was counting page views as leads. Not what we wanted to hear, but it explained a lot.",
    photo_url: null,
    status: "draft",
    is_demo: true,
  },
  {
    name: "Demo Client",
    role: "Example role",
    company: "Demo Company",
    quote:
      "Monthly reports actually say what changed and why. For the first time I can see which campaigns bring in jobs, not just clicks.",
    photo_url: null,
    status: "draft",
    is_demo: true,
  },
  {
    name: "Demo Client",
    role: "Example role",
    company: "Demo Company",
    quote:
      "Our cost per lead went up a little and our sales team is happier than they've been in a year. Fewer calls with people who were never going to buy.",
    photo_url: null,
    status: "draft",
    is_demo: true,
  },
];
