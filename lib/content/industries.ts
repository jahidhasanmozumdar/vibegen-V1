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

export const defaultIndustries: NewRow<"industries">[] = [
  {
    slug: "saas",
    name: "SaaS",
    headline: "Paid acquisition for SaaS that counts demos and trials, not just signups.",
    summary:
      "SaaS funnels have more steps than most: click, signup, activation, demo, trial, paid. We build campaigns and tracking around the steps that lead to revenue, so budget is not judged on the cheapest signup.",
    examples: [
      "B2B SaaS",
      "Vertical SaaS",
      "Developer tools",
      "Product-led growth (PLG) products",
      "Sales-led SaaS with demo funnels",
      "SaaS with free trials or freemium tiers",
    ],
    focus: ["Demo acquisition", "Free trial signups", "Lead generation", "Paid acquisition", "Funnel optimization"],
    challenges: [
      {
        title: "Cheap signups that never activate",
        body: "Campaigns optimized for signups can find lots of people who create an account and never come back. On paper CPA looks great. In revenue terms it is often wasted.",
      },
      {
        title: "Long sales cycles hide what works",
        body: "When a deal takes weeks or months to close, ad platforms only see the first step. Without passing later-stage data back, campaigns optimize for the wrong people.",
      },
      {
        title: "High CPCs on category keywords",
        body: "Competitive SaaS keywords can be expensive. Without tight intent targeting and strong landing pages, CAC climbs quickly.",
      },
      {
        title: "Tracking split across product and marketing",
        body: "Marketing site, app, CRM and billing often live in separate tools. Joining them up is where attribution usually breaks.",
      },
    ],
    approach: [
      {
        title: "Define the conversion that matters",
        body: "We agree which event best predicts revenue, such as a booked demo, an activated trial or a qualified lead, and build campaigns and bidding around it where volume allows.",
      },
      {
        title: "Match offers to buying stage",
        body: "High-intent search gets a demo or trial offer. Colder social audiences often respond better to a lower-commitment step, like a template, a calculator or a product walkthrough.",
      },
      {
        title: "Send downstream data back",
        body: "Where technically feasible, we connect CRM or product events to Google and Meta, so campaigns can be judged on qualified pipeline rather than raw signups.",
      },
      {
        title: "Landing pages per use case",
        body: "One generic homepage rarely converts every audience. We build focused pages for specific use cases, competitors or roles where it makes sense.",
      },
    ],
    services: ["google-ads", "meta-ads", "landing-pages", "cro", "analytics"],
    faqs: [
      {
        question: "Should we optimize for trials or demos?",
        answer:
          "It depends on your sales motion and volume. Demos are closer to revenue but lower volume. Trials give more data but include more low-intent users. Many SaaS accounts run both with separate campaigns and tracking.",
      },
      {
        question: "Can you track which ad led to a paid customer?",
        answer:
          "Often, if your CRM or billing system can be connected and leads carry source data through. Accuracy depends on your stack and sales cycle. We will tell you what is realistic after reviewing your setup.",
      },
      {
        question: "Is Meta useful for B2B SaaS?",
        answer:
          "It can be, particularly for retargeting and for products with a clear, broad audience. For niche B2B products, Google Search is often the stronger starting point.",
      },
      {
        question: "Do you run LinkedIn Ads?",
        answer:
          "Our core services focus on Meta and Google. If LinkedIn is essential for your market, we can discuss it during the audit, but we will not pretend it is our main specialty.",
      },
    ],
    status: "published",
    sort_order: 1,
    ...seo(
      "SaaS Paid Acquisition: Google & Meta Ads for Demos and Trials | VibeGen",
      "Google and Meta ads for SaaS companies, built around demos, trials and qualified pipeline, with landing pages and tracking that connect ads to revenue."
    ),
  },
  {
    slug: "home-services",
    name: "Home Services",
    headline: "More calls and quote requests from people in your service area who are ready to book.",
    summary:
      "Home service leads are local and time-sensitive. We focus on search intent, call tracking and fast, mobile-friendly pages, so you pay for enquiries from real customers in the areas you serve.",
    examples: ["Roofing", "HVAC", "Plumbing", "Cleaning", "Landscaping", "Remodeling", "Pest control"],
    focus: ["Lead generation", "Phone calls", "Quote requests", "Local customer acquisition"],
    challenges: [
      {
        title: "Paying for clicks outside your area",
        body: "Loose location settings can show ads to people who are only interested in your area, or who are nowhere near it. That spend never turns into jobs.",
      },
      {
        title: "Calls that are not tracked",
        body: "Many home service customers call rather than fill in a form. If calls are not tracked, the campaigns producing them look like they are failing.",
      },
      {
        title: "Mixed-intent searches",
        body: "\"How to fix a leaking roof\" and \"roof repair near me\" are very different searches. Without negative keywords and intent grouping, DIY searchers eat the budget.",
      },
      {
        title: "Leads that go cold",
        body: "Slow follow-up loses jobs, especially for urgent services. Good ads cannot make up for a missed call or a quote sent two days late.",
      },
    ],
    approach: [
      {
        title: "Tight local targeting",
        body: "We set location targeting to your real service area and check that ads reach people who are actually there, not people who are just researching it.",
      },
      {
        title: "Track calls and forms",
        body: "Calls from ads and landing pages are tracked alongside forms, so every channel gets credit for the leads it brings in.",
      },
      {
        title: "Separate urgent and planned work",
        body: "Emergency repairs and planned projects need different ads, landing pages and sometimes different budgets. We split them where it helps.",
      },
      {
        title: "Mobile-first pages with a clear next step",
        body: "Most local searches happen on phones. Pages show the phone number, service area, reviews and a short quote form without making people hunt.",
      },
    ],
    services: ["google-ads", "meta-ads", "landing-pages", "analytics"],
    faqs: [
      {
        question: "Do you run Local Services Ads?",
        answer:
          "Our core work is Google Search and Meta. Local Services Ads can be a good addition in eligible categories, and we can advise on how they fit alongside your other campaigns.",
      },
      {
        question: "Can you track phone calls?",
        answer:
          "Yes. We set up call tracking for calls from ads and from landing pages, so you can see which campaigns produce phone leads.",
      },
      {
        question: "Is Meta worth it for home services?",
        answer:
          "For some services, yes, especially seasonal offers, higher-ticket projects like remodeling, and retargeting. For urgent needs, Google Search usually comes first.",
      },
      {
        question: "Do you work with businesses in multiple locations?",
        answer:
          "Yes. Multi-location campaigns need careful structure and tracking so each area's performance is visible. We plan that during setup.",
      },
    ],
    status: "published",
    sort_order: 2,
    ...seo(
      "Google & Meta Ads for Home Service Businesses | VibeGen",
      "Paid ads for roofing, HVAC, plumbing, cleaning, landscaping and more. Local targeting, call tracking and mobile landing pages that turn searches into booked jobs."
    ),
  },
  {
    slug: "professional-services",
    name: "Professional Services",
    headline: "Fewer tire-kickers. More qualified consultations.",
    summary:
      "For consultants, agencies, law firms, accountants and B2B service providers, lead quality matters more than lead volume. We build campaigns and pages that attract the right enquiries and filter out the wrong ones.",
    examples: ["Consulting", "Agencies", "Legal", "Accounting", "B2B services"],
    focus: ["Qualified leads", "Consultation bookings", "Lead quality"],
    challenges: [
      {
        title: "Plenty of leads, few clients",
        body: "A low CPL means little if most enquiries are outside your target market, looking for free advice, or cannot afford your services.",
      },
      {
        title: "Trust has to come first",
        body: "People hiring a lawyer, accountant or consultant are cautious. Pages that look generic or skip credentials lose them quickly.",
      },
      {
        title: "Hard-to-explain services",
        body: "Professional services are often complex. If the ad and page cannot explain the value simply, the right prospects scroll past.",
      },
      {
        title: "Regulated advertising rules",
        body: "Legal and financial services can face platform restrictions and professional advertising rules. Campaigns need to be built with those in mind.",
      },
    ],
    approach: [
      {
        title: "Qualify on the page",
        body: "Clear pricing signals, who you work with and who you do not, plus form questions that help your team prioritize. Some friction is healthy when quality matters.",
      },
      {
        title: "Target by intent and fit",
        body: "Search campaigns focus on terms that show buying intent. On Meta, audiences and messaging are shaped to reach decision-makers rather than the widest possible reach.",
      },
      {
        title: "Feed lead quality back",
        body: "Where possible, we pass qualified and closed leads back to Google and Meta so the platforms learn what a good lead looks like, not just any lead.",
      },
      {
        title: "Lead with credibility",
        body: "Pages show your real credentials, experience, process and client proof. Nothing invented, nothing overstated.",
      },
    ],
    services: ["google-ads", "meta-ads", "landing-pages", "cro", "analytics"],
    faqs: [
      {
        question: "How do you improve lead quality?",
        answer:
          "Mostly through targeting, messaging and the form itself, then by feeding outcome data back to the ad platforms where feasible. A slightly higher CPL is often worth it if more leads become clients.",
      },
      {
        question: "Can you advertise legal or financial services?",
        answer:
          "Yes, within platform policies. You remain responsible for making sure advertising meets the professional rules in your jurisdiction, and we will build campaigns with those constraints in mind.",
      },
      {
        question: "Should we use a booking calendar or a contact form?",
        answer:
          "It depends on your sales process. Direct booking reduces drop-off for ready buyers. A form with qualifying questions helps when you need to screen enquiries first. We sometimes test both.",
      },
    ],
    status: "published",
    sort_order: 3,
    ...seo(
      "Paid Ads for Professional Services Firms | VibeGen",
      "Google and Meta campaigns for consultants, agencies, legal, accounting and B2B service firms, focused on qualified leads and consultation bookings."
    ),
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    headline: "Paid acquisition for online stores, measured on revenue, not just ROAS screenshots.",
    summary:
      "E-commerce ad accounts live or die on product economics and tracking accuracy. We manage acquisition and retargeting with a clear view of margins, conversion rate and revenue attribution.",
    examples: [
      "Direct-to-consumer (DTC) brands",
      "Shopify stores",
      "WooCommerce stores",
      "Subscription products",
      "Niche and specialist retailers",
    ],
    focus: ["Product acquisition", "Retargeting", "Conversion rate optimization", "Tracking", "Revenue attribution"],
    challenges: [
      {
        title: "Platform ROAS that does not match the bank account",
        body: "Meta and Google each claim credit for the same sales. Adding up platform-reported revenue often gives a number bigger than your actual revenue.",
      },
      {
        title: "Retargeting taking credit for sales that would have happened",
        body: "Retargeting past buyers and warm visitors can look very profitable while mostly reaching people who were already going to buy.",
      },
      {
        title: "Product pages and checkout leaks",
        body: "Shipping costs, slow pages and clunky mobile checkout lose sales that the ads already paid for.",
      },
      {
        title: "Margins ignored in bidding",
        body: "A 4x ROAS can be profitable on one product and a loss on another. Treating every product the same wastes budget.",
      },
    ],
    approach: [
      {
        title: "Start with the numbers that matter",
        body: "We work out break-even ROAS and target CAC from your margins and, where available, LTV, so campaign targets reflect your actual economics.",
      },
      {
        title: "Separate new and returning customers",
        body: "Where platforms allow, we look at acquisition of new customers separately from retargeting and repeat purchases.",
      },
      {
        title: "Fix tracking first",
        body: "Purchase events, values and deduplication across Pixel, Conversions API and GA4 are checked before we make big budget calls.",
      },
      {
        title: "CRO on the pages that carry revenue",
        body: "Product pages, collection pages and checkout get reviewed for friction and trust issues, starting with the highest-traffic pages.",
      },
    ],
    services: ["meta-ads", "google-ads", "cro", "analytics", "landing-pages"],
    faqs: [
      {
        question: "Do you manage Google Shopping?",
        answer:
          "We can manage Shopping and Performance Max campaigns alongside Search. Feed quality matters a lot, and while we review your feed, major feed rebuilds may need your developer or a feed tool.",
      },
      {
        question: "Can you produce ad creative for our products?",
        answer:
          "Creative production is not part of the core service. We work with your product photos, videos and UGC, write the ad copy and structure tests around what you provide.",
      },
      {
        question: "What ROAS should we aim for?",
        answer:
          "It depends on your margins, average order value and repeat purchase rate. We calculate a break-even point with you instead of using a generic benchmark.",
      },
    ],
    status: "published",
    sort_order: 4,
    ...seo(
      "E-commerce Paid Ads, CRO & Revenue Tracking | VibeGen",
      "Meta and Google ads for DTC and online stores, with retargeting, CRO and tracking set up to measure real revenue, not just platform-reported ROAS."
    ),
  },
];
