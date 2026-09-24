import type { FaqItem } from "@/lib/data/types";

const creatives: FaqItem = {
  question: "Do you create ad creatives?",
  answer:
    "Creative production is not part of our core service. You provide the images, videos and brand assets. We write the ad copy, advise on which assets to use, and structure creative tests around what you supply. If your assets are limiting results, we will tell you what would help most.",
};

const adSpend: FaqItem = {
  question: "Is ad spend included?",
  answer:
    "No. Our fees cover management, landing pages, CRO and tracking. Ad spend is paid directly by you to Meta and Google through your own ad accounts, so you always see exactly where the money goes.",
};

const guaranteeLeads: FaqItem = {
  question: "Do you guarantee leads?",
  answer:
    "No. Lead volume depends on your offer, market, budget, website, competition and more. Some of that we control, some we don't. What we commit to is a clear plan, disciplined management and honest reporting on what is and isn't working.",
};

const guaranteeRoas: FaqItem = {
  question: "Do you guarantee ROAS?",
  answer:
    "No. ROAS depends on your pricing, margins, conversion rate, sales process and how platforms attribute sales, which is not always accurate. We help you work out what ROAS or CPA you need to be profitable, then manage toward it.",
};

const ownership: FaqItem = {
  question: "Who owns the ad account?",
  answer:
    "You do. Your Meta Business Manager, ad accounts, Google Ads, GA4, GTM, website, domain and CRM stay in your name. We work with access you grant, and you can remove it at any time.",
};

const existingWebsite: FaqItem = {
  question: "Do I need an existing website?",
  answer:
    "It helps, but it is not essential. For paid campaigns, a focused landing page is often more important than a full website. We can build campaign landing pages as part of your plan. If you need a full website, that would be scoped separately.",
};

const landingPages: FaqItem = {
  question: "Can you build landing pages?",
  answer:
    "Yes. We build conversion-focused campaign landing pages, mobile-first, with tracking built in. The number of pages depends on your plan. We do not build unlimited full websites as part of our monthly service.",
};

const saas: FaqItem = {
  question: "Do you work with SaaS companies?",
  answer:
    "Yes. For SaaS we focus on demos, trials and qualified leads rather than raw signups, and on connecting ad data to what happens after signup where technically feasible. Our SaaS industry page explains how we approach it in more detail.",
};

const local: FaqItem = {
  question: "Do you work with local businesses?",
  answer:
    "Yes, particularly home services like roofing, HVAC, plumbing and cleaning. Local campaigns need tight location targeting, call tracking and fast mobile pages, and we set all three up properly.",
};

const budget: FaqItem = {
  question: "What ad budget do I need?",
  answer:
    "Our Launch plan is designed for businesses spending around $2,500 a month or more on ads. Below that, it is hard to gather enough data to optimize, and management fees become a large share of total spend. The right budget depends on your CPCs and how many conversions you need, which we work through during the audit.",
};

const setupTime: FaqItem = {
  question: "How long does setup take?",
  answer:
    "Typically 2–3 weeks. It depends on how quickly we get access to your accounts and the state of your existing tracking. If tracking needs to be rebuilt, we fix that before scaling spend.",
};

const firstMonth: FaqItem = {
  question: "What happens during the first month?",
  answer:
    "We audit your accounts and tracking, fix measurement issues, build or restructure campaigns, and set up or improve landing pages. Once campaigns launch, the early weeks are about gathering data. Expect learning and adjustment, not final results.",
};

const brokenTracking: FaqItem = {
  question: "What happens if tracking is broken?",
  answer:
    "We fix it first. Running campaigns on bad data means the platforms optimize toward the wrong thing and you can't tell what is working. Tracking repairs are part of setup, and we tell you plainly what was wrong and what it affected.",
};

const outsideUs: FaqItem = {
  question: "Do you work outside the US?",
  answer:
    "Yes. Our main markets are the US and the UK, and we can work with businesses in other English-speaking markets where the fit is right. We handle location targeting, currency and time zones as part of setup.",
};

const uk: FaqItem = {
  question: "Do you work with UK businesses?",
  answer:
    "Yes. We run campaigns for UK businesses and for businesses targeting both the US and the UK. Pricing is shown in USD, and we can discuss billing arrangements during the proposal stage.",
};

const minimumContract: FaqItem = {
  question: "What is the minimum contract?",
  answer:
    "Our standard terms include an initial 3-month minimum, because campaigns need time to gather data and settle. After that, it moves to month-to-month. The specific terms for your engagement are set out in your proposal and agreement.",
};

const cancel: FaqItem = {
  question: "Can I cancel?",
  answer:
    "Yes. Under our standard terms, after the initial period you can cancel with 30 days' notice. Your accounts and data stay with you. Check your proposal and agreement for the exact terms that apply to you.",
};

const reports: FaqItem = {
  question: "Do you provide reports?",
  answer:
    "Yes. Reporting frequency depends on your plan: monthly, bi-weekly or custom. Reports cover spend, leads, cost per lead and, where tracking allows, revenue and pipeline, plus what we changed and what we plan to do next.",
};

const crm: FaqItem = {
  question: "Do you offer CRM integration?",
  answer:
    "Where technically feasible, yes. We can connect common CRMs to your tracking so lead outcomes are sent back to Google and Meta. What is possible depends on your CRM, your plan level and how leads are captured.",
};

export const generalFaqs: FaqItem[] = [
  creatives,
  adSpend,
  guaranteeLeads,
  guaranteeRoas,
  ownership,
  existingWebsite,
  landingPages,
  saas,
  local,
  budget,
  setupTime,
  firstMonth,
  brokenTracking,
  outsideUs,
  uk,
  minimumContract,
  cancel,
  reports,
  crm,
];

/** Curated, sales-relevant subset for the homepage. Same objects as above. */
export const homeFaqs: FaqItem[] = [
  adSpend,
  creatives,
  guaranteeLeads,
  ownership,
  budget,
  setupTime,
  minimumContract,
];
