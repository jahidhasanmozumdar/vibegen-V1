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

export const defaultServices: NewRow<"services">[] = [
  /* ---------------------------------------------------------------- */
  /* Meta Ads                                                          */
  /* ---------------------------------------------------------------- */
  {
    slug: "meta-ads",
    name: "Meta Ads",
    tagline: "Facebook and Instagram campaigns built around the leads and sales you actually need.",
    summary:
      "Prospecting, retargeting and audience testing on Facebook and Instagram, structured so budget moves toward what converts, not what gets the cheapest clicks.",
    description:
      "Meta can bring in a lot of demand quickly. It can also burn through a budget on clicks from people who were never going to buy. The difference usually comes down to campaign structure, how audiences are tested, and whether the platform is optimizing for the right conversion event.\n\n" +
      "We plan, build and manage Facebook and Instagram campaigns across prospecting and retargeting. That means setting up a structure the algorithm can learn from, testing audiences in a deliberate order, moving budget based on real conversion data, and making sure the people who click land somewhere that matches what the ad promised.\n\n" +
      "One thing to know up front: creative production is not part of the core service. You provide the images, videos and brand assets. We advise on which assets to use, write the ad copy, and structure creative tests around what you supply. If you need new creative produced, we can talk about that separately.",
    capabilities: [
      "Facebook and Instagram campaigns",
      "Prospecting campaigns",
      "Retargeting campaigns",
      "Audience research and testing",
      "Campaign and ad set structure",
      "Budget allocation and pacing",
      "Conversion event optimization",
      "Ad copy writing",
      "Funnel and landing page alignment",
      "Performance monitoring and reporting",
    ],
    features: [
      {
        title: "Campaign structure the algorithm can learn from",
        body: "Too many ad sets with tiny budgets starve Meta of data. We consolidate where it helps and separate where it matters, so each campaign has enough volume to optimize.",
      },
      {
        title: "Prospecting and retargeting that work together",
        body: "Prospecting finds new people. Retargeting follows up with people who showed interest. We size and sequence both so you are not paying twice to reach the same person with the same message.",
      },
      {
        title: "Deliberate audience testing",
        body: "Broad, interest-based and lookalike audiences each have a place. We test them in a planned order with clear success criteria instead of launching everything at once and guessing.",
      },
      {
        title: "Optimizing for the right conversion",
        body: "If Meta is told to optimize for page views, it finds people who view pages. We set campaigns to optimize for the event closest to revenue that still has enough volume to learn from.",
      },
      {
        title: "Creative testing with your assets",
        body: "We organize your existing images and videos into structured tests: different hooks, formats and angles. What we can test depends on what you provide, and we will tell you plainly when a gap in assets is holding results back.",
      },
    ],
    benefits: [
      {
        title: "Budget goes where conversions happen",
        body: "Spend is shifted toward the audiences and ads that produce leads or sales, based on tracked results rather than platform-reported engagement.",
      },
      {
        title: "Clearer picture of what is working",
        body: "You know which campaigns, audiences and ads are driving results, and which ones are just spending money.",
      },
      {
        title: "Less wasted retargeting",
        body: "Frequency and audience windows are managed so past visitors see relevant follow-up instead of the same ad twenty times.",
      },
      {
        title: "Ads and pages that match",
        body: "The offer and message in the ad line up with the landing page, which usually makes a bigger difference to cost per lead than any bid change.",
      },
    ],
    included: [
      "Account and pixel review before launch",
      "Campaign strategy and structure",
      "Prospecting and retargeting campaigns",
      "Audience research, setup and testing",
      "Ad copy for all active ads",
      "Creative testing using client-provided assets",
      "Budget management and optimization",
      "Conversion event setup review",
      "Landing page feedback for message match",
      "Regular performance reporting",
    ],
    not_included: [
      "Creative production (photography, video shoots, motion graphics)",
      "Graphic design of new ad images",
      "Ad spend (paid directly by you to Meta)",
      "Organic social media management",
      "Community management and comment moderation",
      "Influencer sourcing or management",
    ],
    faqs: [
      {
        question: "Do you create the ad images and videos?",
        answer:
          "No, creative production is not part of the core Meta Ads service. You provide existing images, videos and brand assets. We write the ad copy, advise on which assets are likely to work, and run structured creative tests with what you supply. If you need new creative made, we can discuss it separately.",
      },
      {
        question: "What if I don't have much creative to work with?",
        answer:
          "We can still launch, but creative testing will be limited. We will tell you which types of assets would help most, for example short vertical video, customer photos or simple product demos, so you can prioritize what to produce.",
      },
      {
        question: "Is Meta a good fit for B2B or high-ticket offers?",
        answer:
          "It can be, but it usually works best with a lower-commitment first step, like a guide, a calculator or a short consultation. We will be honest if we think your offer is better suited to Google Search first.",
      },
      {
        question: "How long before we know if Meta ads are working?",
        answer:
          "The first few weeks are about gathering data and letting campaigns exit the learning phase. Most accounts need several weeks of stable spend before trends are reliable. How long depends on budget and conversion volume.",
      },
      {
        question: "Do you use the Meta Conversions API?",
        answer:
          "Where it is appropriate and technically feasible, yes. The Conversions API sends conversion data from your server, which helps when browser tracking misses events. It is covered in our Analytics & Tracking work.",
      },
    ],
    status: "published",
    sort_order: 1,
    ...seo(
      "Meta Ads Management for Facebook & Instagram | VibeGen",
      "Facebook and Instagram ad management focused on leads and sales: prospecting, retargeting, audience testing and conversion optimization for US and UK businesses."
    ),
  },

  /* ---------------------------------------------------------------- */
  /* Google Ads                                                        */
  /* ---------------------------------------------------------------- */
  {
    slug: "google-ads",
    name: "Google Ads",
    tagline: "Show up when people are searching for what you sell, and stop paying for searches that never convert.",
    summary:
      "Search campaigns built on real search intent, tight keyword control and clean conversion tracking, so your budget goes to people ready to act.",
    description:
      "Google Search is different from social ads. People are already looking for something. Your job is to show up for the right searches, with the right message, and not pay for the wrong ones. Most wasted Google Ads budget comes from loose match types, missing negative keywords and campaigns that cannot tell a lead from a page view.\n\n" +
      "We build and manage search campaigns around intent. That starts with keyword research, grouping terms by what the searcher actually wants, and writing ads that speak to that. Then it is ongoing work: reviewing search terms, adding negatives, adjusting bids and budgets, and making sure clicks land on a page built for that search.\n\n" +
      "Where it makes sense, we add remarketing to follow up with people who visited but did not convert. We do not add campaign types just to use the whole platform. Everything is tied back to conversion tracking you can trust.",
    capabilities: [
      "Search campaigns",
      "Keyword research",
      "Search intent mapping",
      "Negative keyword management",
      "Campaign and ad group structure",
      "Bid strategy and optimization",
      "Google Ads conversion tracking",
      "Search term analysis",
      "Remarketing where appropriate",
      "Budget allocation and landing page alignment",
    ],
    features: [
      {
        title: "Keywords grouped by intent",
        body: "Someone searching \"emergency plumber near me\" wants something different from someone searching \"how to fix a leaking pipe\". We group keywords by intent so ads and landing pages match what the searcher wants.",
      },
      {
        title: "Weekly search term reviews",
        body: "We look at the actual searches triggering your ads, not just the keywords you bid on. Irrelevant terms become negatives. Good ones get their own keywords and ads.",
      },
      {
        title: "Bidding based on real conversions",
        body: "Automated bid strategies are only as good as the conversion data behind them. We make sure the conversions being counted are the ones that matter before handing bidding to the algorithm.",
      },
      {
        title: "Budget split by what earns it",
        body: "Budget is allocated across campaigns based on cost per conversion and lead quality, not spread evenly. Campaigns that are limited by budget and converting well get priority.",
      },
      {
        title: "Landing pages that match the search",
        body: "Sending every click to your homepage is one of the most common leaks we see. We match each ad group to the most relevant page, and flag where a dedicated landing page would help.",
      },
    ],
    benefits: [
      {
        title: "Less spend on irrelevant searches",
        body: "Ongoing negative keyword work cuts the clicks that were never going to convert.",
      },
      {
        title: "More qualified enquiries",
        body: "Targeting by intent tends to bring in people closer to a buying decision, which helps your sales team as much as your CPL.",
      },
      {
        title: "Numbers you can make decisions with",
        body: "Clean conversion tracking means you can see which campaigns and keywords actually produce leads or sales.",
      },
    ],
    included: [
      "Account audit before launch or takeover",
      "Keyword research and intent mapping",
      "Search campaign structure and build",
      "Ad copy and ad assets",
      "Negative keyword lists and ongoing search term reviews",
      "Bid strategy selection and optimization",
      "Google Ads conversion tracking setup or review",
      "Remarketing campaigns where appropriate",
      "Budget allocation and pacing",
      "Landing page recommendations",
      "Regular performance reporting",
    ],
    not_included: [
      "Ad spend (paid directly by you to Google)",
      "Video production for YouTube campaigns",
      "SEO or organic search work",
      "Google Business Profile management",
      "Merchant Center feed rebuilds beyond basic setup review",
    ],
    faqs: [
      {
        question: "Do you run Performance Max or Display campaigns?",
        answer:
          "Only when they fit. For most lead generation accounts, well-managed Search is the core. We add other campaign types when there is enough conversion data and a clear reason, not by default.",
      },
      {
        question: "Can you take over an existing Google Ads account?",
        answer:
          "Yes. We start with an audit to understand what has been working, what has not, and whether conversion tracking can be trusted. We keep the account history rather than starting a new one wherever possible.",
      },
      {
        question: "How much should I spend on Google Ads?",
        answer:
          "It depends on your cost per click, your conversion rate and how many conversions you need for the data to be useful. As a rough starting point, you want enough budget to get a meaningful number of clicks per day in your main campaign. We work through the numbers with you before launch.",
      },
      {
        question: "Why are my clicks so expensive?",
        answer:
          "Some markets are simply competitive. But high CPCs are often made worse by broad targeting, weak ad relevance or poor landing page experience, all of which affect what you pay. We look at all of these before assuming the market is the problem.",
      },
      {
        question: "Do you work with UK Google Ads accounts?",
        answer:
          "Yes. We manage campaigns targeting the US, the UK, or both, and set up location targeting, currency and scheduling to suit each market.",
      },
    ],
    status: "published",
    sort_order: 2,
    ...seo(
      "Google Ads Management & Search Campaigns | VibeGen",
      "Google Search campaigns built on intent: keyword research, negative keywords, bid optimization and conversion tracking for US and UK businesses."
    ),
  },

  /* ---------------------------------------------------------------- */
  /* Landing Pages                                                     */
  /* ---------------------------------------------------------------- */
  {
    slug: "landing-pages",
    name: "Landing Pages",
    tagline: "Campaign landing pages built to turn paid clicks into leads and sales.",
    summary:
      "Focused, mobile-first landing pages for your paid campaigns, built around one offer, one audience and one clear next step.",
    description:
      "Every paid campaign follows the same path: Ad, then Landing Page, then Conversion. If the page does not match what the ad promised, you pay for the click and lose the visitor. That is why we treat landing pages as part of the campaign, not a separate web project.\n\n" +
      "We build conversion-focused landing pages for specific campaigns. Each page is built around message match: the same intent, offer, message and audience as the ad, with a clear CTA and tracking that records what happens. Pages are mobile-first, fast, and include the trust elements people look for before they fill in a form.\n\n" +
      "To be clear on scope: this service covers campaign landing pages, not unlimited full websites. We build a defined number of pages per month depending on your plan. If you need a full site rebuild, we will tell you and scope it separately.",
    capabilities: [
      "Campaign landing pages",
      "Mobile-first layouts",
      "Value proposition and headline writing",
      "CTA and lead form design",
      "Trust elements and guarantees",
      "Social proof sections using your real proof",
      "Offer presentation",
      "Tracking integration",
      "Page speed optimization",
    ],
    features: [
      {
        title: "Message match with the ad",
        body: "We line up six things between ad and page: intent, offer, message, audience, CTA and tracking. When they match, visitors recognize they are in the right place within a few seconds.",
      },
      {
        title: "A clear value proposition",
        body: "The top of the page answers three questions fast: what is this, who is it for, and why should I act now. If a visitor has to scroll to work that out, many will not.",
      },
      {
        title: "Forms people actually finish",
        body: "We ask for what your sales process needs and nothing more. Field count, field order, button copy and error handling all get attention, especially on mobile.",
      },
      {
        title: "Trust built from your real proof",
        body: "Reviews, testimonials, client logos, certifications and guarantees, but only ones that are real. We work with what you have and tell you where adding proof would help.",
      },
      {
        title: "Tracking wired in from day one",
        body: "Form submissions, calls and key clicks are tracked in GA4 and sent to your ad platforms, so the page's performance is measurable from the first visitor.",
      },
    ],
    benefits: [
      {
        title: "Better conversion rate from the same traffic",
        body: "A focused page that matches the ad usually converts more of the visitors you are already paying for.",
      },
      {
        title: "Lower cost per lead over time",
        body: "When more clicks convert, each lead costs less, and ad platforms tend to reward relevant pages.",
      },
      {
        title: "Faster campaign testing",
        body: "New offers or audiences can get their own page without waiting on a full website change.",
      },
    ],
    included: [
      "Landing page strategy per campaign",
      "Page copy and structure",
      "Mobile-first design and build",
      "Lead forms or booking integration",
      "Trust and social proof sections using client-provided proof",
      "GA4, GTM and ad platform conversion tracking",
      "Speed and basic technical checks",
      "Post-launch review and iteration",
    ],
    not_included: [
      "Full website design or rebuilds",
      "Unlimited page builds",
      "Custom photography or video",
      "Writing or inventing testimonials, reviews or case studies",
      "E-commerce store builds",
      "Ongoing website hosting and maintenance",
    ],
    faqs: [
      {
        question: "Do you build full websites?",
        answer:
          "No. This service is for campaign landing pages. The number of pages depends on your plan. If your main website needs a rebuild, we will say so and can scope it as a separate project.",
      },
      {
        question: "What platform do you build landing pages on?",
        answer:
          "We work with your existing setup where possible, such as WordPress, Webflow, Shopify or a dedicated landing page tool. The priority is a page that loads fast, tracks correctly and that your team can access.",
      },
      {
        question: "Do I need a landing page if I already have a website?",
        answer:
          "Often, yes. Most website pages are built to inform many different visitors. A campaign landing page is built for one audience and one action, which usually converts paid traffic better.",
      },
      {
        question: "Can you add testimonials and reviews?",
        answer:
          "Yes, using your real ones. We never write fake testimonials or invent proof. If you do not have much yet, we will suggest ways to collect it.",
      },
      {
        question: "Who owns the landing pages?",
        answer:
          "You do. Pages are built on your domain and your accounts wherever possible.",
      },
    ],
    status: "published",
    sort_order: 3,
    ...seo(
      "Conversion-Focused Landing Pages for Paid Campaigns | VibeGen",
      "Mobile-first campaign landing pages built for message match with your ads: clear offers, trust elements, lead forms and tracking included."
    ),
  },

  /* ---------------------------------------------------------------- */
  /* CRO                                                               */
  /* ---------------------------------------------------------------- */
  {
    slug: "cro",
    name: "CRO",
    tagline: "Find out why visitors leave without converting, then fix the reasons that matter most.",
    summary:
      "Conversion rate optimization based on research, not guesswork: offer clarity, message match, friction, trust and testing where your traffic supports it.",
    description:
      "CRO is not \"change the button color and hope\". Most conversion problems come from bigger things: an offer that is unclear, a page that does not match the visitor's intent, too much friction in the form, not enough trust, or traffic that was never a good fit.\n\n" +
      "We start with research. Quantitative data shows where people drop off. Qualitative data, such as heatmaps, session recordings and on-page feedback where appropriate, shows why. From there we prioritize changes by likely impact and effort, and work through them.\n\n" +
      "Testing is part of CRO, but it is not always possible. A reliable A/B test needs enough traffic and conversions to reach a clear answer. We do not promise unlimited tests. For lower-traffic sites, we make research-led changes and monitor the results instead of running tests that would never reach significance.",
    capabilities: [
      "Offer clarity review",
      "Message match analysis",
      "Search and visitor intent review",
      "Friction and form experience audits",
      "Trust and credibility review",
      "CTA and page structure improvements",
      "Traffic quality analysis",
      "Heatmaps and session recordings where appropriate",
      "Funnel drop-off analysis",
      "A/B testing where traffic allows",
    ],
    features: [
      {
        title: "Quantitative analysis",
        body: "We use GA4 and funnel data to find where visitors drop off, which devices and sources underperform, and which pages carry the most weight.",
      },
      {
        title: "Qualitative research",
        body: "Heatmaps, session recordings and short on-page surveys, where appropriate, show what visitors are doing and what is confusing them.",
      },
      {
        title: "Prioritized hypotheses",
        body: "Every proposed change comes with a reason, the evidence behind it, and an estimate of impact and effort. The highest-value fixes go first.",
      },
      {
        title: "Testing when the numbers support it",
        body: "When traffic and conversion volume are high enough, we run A/B tests. When they are not, we make research-led changes and track before-and-after performance, with the limits of that approach made clear.",
      },
      {
        title: "Traffic quality checks",
        body: "Sometimes the page is fine and the traffic is wrong. We check whether campaigns are sending the right visitors before rebuilding a page that might not be the problem.",
      },
    ],
    benefits: [
      {
        title: "More value from existing traffic",
        body: "Improving conversion rate means each dollar of ad spend has a better chance of producing a lead or sale.",
      },
      {
        title: "Decisions based on evidence",
        body: "Changes are backed by data and research, not by whoever has the strongest opinion in the meeting.",
      },
      {
        title: "Fewer expensive redesigns",
        body: "Targeted fixes to the parts of the page that matter often do more than a full redesign, at a fraction of the effort.",
      },
    ],
    included: [
      "Conversion audit of key pages and funnels",
      "Quantitative funnel analysis",
      "Heatmap and session recording setup where appropriate",
      "Prioritized list of recommendations",
      "Implementation of agreed page changes (within plan scope)",
      "A/B tests where traffic and conversion volume allow",
      "Before-and-after performance monitoring",
    ],
    not_included: [
      "Unlimited A/B tests",
      "Guaranteed conversion rate increases",
      "Full website redesigns",
      "Backend development or checkout rebuilds",
      "User research panels or paid user testing recruitment",
    ],
    faqs: [
      {
        question: "Is CRO just A/B testing?",
        answer:
          "No. Testing is one tool. Most of the value comes from research: understanding where and why visitors drop off, then fixing the biggest problems in the offer, message, trust and friction.",
      },
      {
        question: "My site doesn't get much traffic. Can I still do CRO?",
        answer:
          "Yes, but it looks different. Low-traffic sites often cannot run reliable A/B tests. Instead, we make research-led changes based on best practice and visitor behavior, then monitor results over time.",
      },
      {
        question: "How many tests will you run each month?",
        answer:
          "It depends on your traffic and conversion volume. We will not promise a fixed number of tests, because running a test that cannot reach a clear result wastes time and can lead to wrong decisions.",
      },
      {
        question: "Do you use heatmaps and session recordings?",
        answer:
          "Where appropriate, yes. We use tools such as Microsoft Clarity or Hotjar, set up with privacy settings that respect your visitors and your legal obligations.",
      },
      {
        question: "Can you guarantee a conversion rate increase?",
        answer:
          "No. Conversion rate depends on your offer, pricing, market, traffic and more. What we can commit to is a clear process, prioritized changes and honest reporting on what happened.",
      },
    ],
    status: "published",
    sort_order: 4,
    ...seo(
      "Conversion Rate Optimization (CRO) Services | VibeGen",
      "Research-led CRO for paid traffic: offer clarity, message match, friction and trust. A/B testing where traffic allows, research-led changes where it doesn't."
    ),
  },

  /* ---------------------------------------------------------------- */
  /* Analytics & Tracking                                              */
  /* ---------------------------------------------------------------- */
  {
    slug: "analytics",
    name: "Analytics & Tracking",
    tagline: "Know what is actually working.",
    summary:
      "GA4, GTM, Meta Pixel and conversion tracking set up properly, so you can see where leads come from and which campaigns turn into customers.",
    description:
      "If your tracking is broken, every other decision is a guess. Ad platforms optimize toward whatever conversion data they receive. If that data is missing, duplicated or counting the wrong thing, budget gets pushed in the wrong direction and nobody notices until the bank balance does.\n\n" +
      "We set up and fix the measurement layer behind your marketing: GA4, Google Tag Manager, the Meta Pixel, Google Ads and Meta conversion tracking, UTM conventions and funnel events. Where it is appropriate, we add server-side tracking or the Meta Conversions API, and connect to your CRM where technically feasible.\n\n" +
      "The goal is to answer five questions clearly: where users came from, what they did, where they dropped off, which campaigns generate leads, and which leads become customers. How far we can take that depends on your tracking setup, your tools and your business model, and we will be clear about what is and is not measurable.",
    capabilities: [
      "GA4 setup and configuration",
      "Google Tag Manager",
      "Meta Pixel",
      "Conversion event setup",
      "UTM tracking conventions",
      "Funnel tracking",
      "Lead tracking",
      "Google Ads conversion tracking",
      "Meta conversion tracking",
      "CRM integrations where technically feasible",
      "Server-side tracking and Conversions API where appropriate",
      "Attribution and reporting",
    ],
    features: [
      {
        title: "Tracking audit",
        body: "We check what is firing, what is missing and what is double-counting across GA4, GTM, the Meta Pixel and Google Ads. You get a plain-English list of what is wrong and what it affects.",
      },
      {
        title: "Clean conversion events",
        body: "We define which actions count as conversions, name them consistently, and make sure each platform receives the right ones. Form fills, calls, bookings and purchases are tracked as separate events.",
      },
      {
        title: "UTM and source tracking",
        body: "Consistent UTM conventions across every campaign, with source data captured alongside each lead, so you can see where leads came from beyond what the ad platforms report.",
      },
      {
        title: "Server-side and CAPI where appropriate",
        body: "Browser tracking misses more events than it used to. Where it makes sense, we add the Meta Conversions API or server-side tagging to fill the gaps.",
      },
      {
        title: "CRM and offline conversions",
        body: "Where technically feasible, we connect lead outcomes from your CRM back to the ad platforms, so campaigns can be judged on customers, not just form fills.",
      },
      {
        title: "Reporting you can read",
        body: "Dashboards and reports that show spend, leads, cost per lead and, where data allows, revenue by channel and campaign, without drowning you in metrics.",
      },
    ],
    benefits: [
      {
        title: "Decisions based on real data",
        body: "Budget moves based on what is actually driving leads and sales, not on what a platform claims.",
      },
      {
        title: "Ad platforms that optimize properly",
        body: "Accurate conversion data helps Meta and Google find more of the people who convert.",
      },
      {
        title: "A clear view of the full funnel",
        body: "See where people come from, where they drop off and which campaigns produce customers, not just clicks.",
      },
      {
        title: "Fewer surprises",
        body: "Broken tracking gets caught early instead of months later when the numbers stop making sense.",
      },
    ],
    included: [
      "Tracking audit across GA4, GTM and ad platforms",
      "GA4 property configuration",
      "GTM container setup or cleanup",
      "Meta Pixel and Google Ads conversion tracking",
      "Conversion event definitions and naming",
      "UTM naming conventions",
      "Lead source capture",
      "Conversions API or server-side tracking where appropriate",
      "CRM and offline conversion connections where technically feasible",
      "Reporting dashboard",
    ],
    not_included: [
      "Custom data warehouse or BI builds",
      "Legal advice on privacy, cookies or consent requirements",
      "CRM implementation or migration",
      "Tracking for platforms we do not have access to",
      "Perfect attribution (no tool can fully deliver this)",
    ],
    faqs: [
      {
        question: "Why do Meta, Google and GA4 all show different numbers?",
        answer:
          "Each platform uses its own attribution rules, windows and data sources. Meta and Google each tend to claim credit for conversions they touched. Some difference is normal. Big gaps usually point to a tracking problem worth fixing.",
      },
      {
        question: "Do I need server-side tracking?",
        answer:
          "Not always. It helps most when browser tracking is losing a meaningful share of conversions, for example due to ad blockers or browser privacy features. We recommend it where the benefit justifies the setup.",
      },
      {
        question: "Can you connect our CRM?",
        answer:
          "Where technically feasible, yes. Common CRMs such as HubSpot, Salesforce, Pipedrive and GoHighLevel can often send lead outcomes back to Google and Meta. Feasibility depends on your CRM, plan level and how leads are captured.",
      },
      {
        question: "Can you tell me exactly which ad produced each sale?",
        answer:
          "Sometimes, but not always. Attribution depends on tracking quality, sales cycle length and how many touchpoints a customer has. We aim for data that is accurate enough to make good budget decisions, and we are honest about its limits.",
      },
      {
        question: "Do you handle cookie consent?",
        answer:
          "We configure tracking to work with your consent tool, including Google Consent Mode where relevant. Your legal obligations, especially for UK and EU visitors, should be confirmed with your own legal advisor.",
      },
    ],
    status: "published",
    sort_order: 5,
    ...seo(
      "Analytics & Conversion Tracking (GA4, GTM, Meta Pixel) | VibeGen",
      "GA4, Google Tag Manager, Meta Pixel, Conversions API and CRM tracking set up properly, so you know which campaigns produce leads and customers."
    ),
  },
];
