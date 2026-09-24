import type { ServiceSlug } from "@/lib/data/types";

export interface ProcessStage {
  slug: string;
  name: string;
  summary: string;
  whatHappens: string;
  weDo: string[];
  youProvide: string[];
  deliverables: string[];
  timing: string;
}

export const processStages: ProcessStage[] = [
  {
    slug: "discover",
    name: "Discover",
    summary: "Understand the business before touching the ads.",
    whatHappens:
      "We learn how you make money: your offer, pricing, margins, customers, sales process and what has been tried before. Good campaigns start from the business model, not the ad platform.",
    weDo: [
      "Run a discovery call with you and your team",
      "Review your offer, pricing and target customers",
      "Understand your sales process and lead follow-up",
      "Agree goals and what a good lead or sale looks like",
    ],
    youProvide: [
      "Time for a discovery call",
      "Offer and pricing details",
      "Current results and past campaign history",
      "Sales process overview",
    ],
    deliverables: ["Agreed goals and success measures", "Discovery notes and key questions"],
    timing: "Week 1",
  },
  {
    slug: "audit",
    name: "Audit",
    summary: "Find what is working, what is broken and what is missing.",
    whatHappens:
      "We review your ad accounts, landing pages and tracking. Most accounts have a few problems causing most of the waste. The audit finds them and ranks them by impact.",
    weDo: [
      "Audit Meta and Google Ads accounts",
      "Check GA4, GTM, Pixel and conversion tracking",
      "Review landing pages and conversion paths",
      "Identify quick fixes and bigger opportunities",
    ],
    youProvide: [
      "Access to ad accounts, GA4, GTM and website",
      "CRM access or lead data where available",
    ],
    deliverables: ["Audit findings with priorities", "Tracking fix list", "Campaign and page recommendations"],
    timing: "Week 1–2",
  },
  {
    slug: "build",
    name: "Build",
    summary: "Fix tracking, build campaigns and prepare landing pages.",
    whatHappens:
      "Tracking gets fixed first, so everything that follows is measured properly. Then we build or restructure campaigns and create or improve the landing pages they point to.",
    weDo: [
      "Fix or set up GA4, GTM, Pixel and conversion events",
      "Set up UTM conventions",
      "Build campaign structures, audiences and keywords",
      "Write ad copy and organize creative tests",
      "Build or improve landing pages",
    ],
    youProvide: [
      "Images, videos and brand assets",
      "Testimonials and proof you are happy to use",
      "Feedback and approvals on copy and pages",
    ],
    deliverables: ["Working conversion tracking", "Campaigns ready to launch", "Landing pages live"],
    timing: "Week 2–3",
  },
  {
    slug: "launch",
    name: "Launch",
    summary: "Go live carefully and check everything is recording.",
    whatHappens:
      "Campaigns go live with controlled budgets. We watch closely in the first days to confirm tracking is firing, spend is pacing and nothing unexpected is happening.",
    weDo: [
      "Launch campaigns with controlled budgets",
      "Verify conversions are recording correctly",
      "Monitor spend, delivery and early signals daily",
      "Fix anything that breaks",
    ],
    youProvide: ["Final approval to launch", "Fast follow-up on incoming leads"],
    deliverables: ["Live campaigns", "Launch checklist confirmed", "Early performance update"],
    timing: "Week 3–4",
  },
  {
    slug: "optimize",
    name: "Optimize",
    summary: "Use real data to cut waste and improve conversion.",
    whatHappens:
      "Once data builds up, we make regular changes: search terms, negatives, audiences, bids, budgets, ads and page improvements. Each change has a reason, and we report on what it did.",
    weDo: [
      "Review search terms and add negative keywords",
      "Test audiences, ads and offers",
      "Shift budget toward what converts",
      "Make CRO improvements to landing pages",
      "Report on results and next steps",
    ],
    youProvide: ["Lead quality feedback", "Updates on offers, pricing or capacity", "New assets when available"],
    deliverables: ["Regular reports", "Optimization log", "Strategy calls (per plan)"],
    timing: "Month 2 onward",
  },
  {
    slug: "scale",
    name: "Scale",
    summary: "Grow spend where the numbers support it.",
    whatHappens:
      "When campaigns are hitting target CPA or ROAS consistently, we increase budget in steps, expand into new audiences, keywords or offers, and keep an eye on efficiency as spend grows.",
    weDo: [
      "Increase budgets in controlled steps",
      "Expand audiences, keywords and campaigns",
      "Add new landing pages for new offers or segments",
      "Improve attribution as spend and complexity grow",
    ],
    youProvide: ["Capacity to handle more leads or orders", "Budget approval for increases"],
    deliverables: ["Scaling plan", "Updated forecasts and targets", "Expanded campaign structure"],
    timing: "When results support it",
  },
];

export const growthSystem: {
  key: "attract" | "capture" | "convert" | "measure" | "optimize";
  label: string;
  channels: string;
  body: string;
  services: ServiceSlug[];
}[] = [
  {
    key: "attract",
    label: "ATTRACT",
    channels: "Meta Ads + Google Ads",
    body: "Reach people who are searching for what you sell and people who fit your ideal customer profile. Campaigns are structured around intent and audience, not just reach.",
    services: ["meta-ads", "google-ads"],
  },
  {
    key: "capture",
    label: "CAPTURE",
    channels: "Landing Page",
    body: "Send clicks to a page that matches the ad's promise and makes the next step obvious. A focused page gives paid traffic a reason to stay.",
    services: ["landing-pages"],
  },
  {
    key: "convert",
    label: "CONVERT",
    channels: "CRO",
    body: "Remove the friction, confusion and trust gaps that stop visitors from acting. Small fixes in the right places often matter more than more traffic.",
    services: ["cro"],
  },
  {
    key: "measure",
    label: "MEASURE",
    channels: "Analytics & Tracking",
    body: "Track where every lead came from and what happened next. Reliable data is what lets ad platforms, and you, make good decisions.",
    services: ["analytics"],
  },
  {
    key: "optimize",
    label: "OPTIMIZE",
    channels: "Continuous Improvement",
    body: "Use the data to cut waste, test new ideas and move budget toward what works. The system improves each month instead of being set and forgotten.",
    services: ["meta-ads", "google-ads", "landing-pages", "cro", "analytics"],
  },
];
