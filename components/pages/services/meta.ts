import { growthSystem } from "@/lib/content/process";
import type { ServiceSlug } from "@/lib/data/types";

type Stage = (typeof growthSystem)[number];

/** The growth-system stage a service belongs to (Attract, Capture…), ignoring the catch-all Optimize. */
export function stageFor(slug: ServiceSlug): Stage | undefined {
  return growthSystem.find((stage) => stage.key !== "optimize" && stage.services.includes(slug));
}

export function sentenceCase(label: string): string {
  return label.charAt(0) + label.slice(1).toLowerCase();
}

/** Hand-picked neighbours for internal linking between service pages. */
export const relatedServices: Record<ServiceSlug, ServiceSlug[]> = {
  "meta-ads": ["google-ads", "landing-pages", "analytics"],
  "google-ads": ["meta-ads", "landing-pages", "analytics"],
  "landing-pages": ["cro", "google-ads", "meta-ads"],
  cro: ["landing-pages", "analytics", "google-ads"],
  analytics: ["meta-ads", "google-ads", "cro"],
};

/** The most honest line from each service description (verbatim from lib/content/services.ts). */
export const honestLine: Record<ServiceSlug, string> = {
  "meta-ads": "Meta can bring in a lot of demand quickly. It can also burn through a budget on clicks from people who were never going to buy.",
  "google-ads": "We do not add campaign types just to use the whole platform. Everything is tied back to conversion tracking you can trust.",
  "landing-pages": "If the page does not match what the ad promised, you pay for the click and lose the visitor.",
  cro: "A reliable A/B test needs enough traffic and conversions to reach a clear answer. We do not promise unlimited tests.",
  analytics: "If your tracking is broken, every other decision is a guess.",
};

/** Hero headline per service. Always contains the service name; `accent` is the serif phrase. */
export const heroCopy: Record<ServiceSlug, { title: string; accent: string }> = {
  "meta-ads": { title: "Meta Ads that find buyers, not just clicks.", accent: "buyers," },
  "google-ads": { title: "Google Ads that pay for intent, not noise.", accent: "intent," },
  "landing-pages": { title: "Landing pages that keep the ad’s promise.", accent: "promise." },
  cro: { title: "CRO that fixes why visitors leave.", accent: "why" },
  analytics: { title: "Analytics & tracking you can actually trust.", accent: "trust." },
};

/**
 * The argument each service page makes: what the owner sees, what is actually
 * causing it, and what we do about it. Written from the service content.
 */
export const serviceLedger: Record<ServiceSlug, { problem: string; cause: string; fix: string }[]> = {
  "meta-ads": [
    {
      problem: "Lots of clicks and cheap leads, very few sales.",
      cause: "Meta is optimizing for the event it was told to, often a page view or a cheap form fill, so it finds people who do exactly that.",
      fix: "We set campaigns to optimize for the event closest to revenue that still has enough volume for Meta to learn from.",
    },
    {
      problem: "Results swing wildly week to week.",
      cause: "Too many ad sets with tiny budgets starve the algorithm of data, so it never leaves the learning phase.",
      fix: "We consolidate where it helps and separate where it matters, so each campaign has enough volume to optimize.",
    },
    {
      problem: "The same people see the same ad twenty times.",
      cause: "Prospecting and retargeting overlap, and frequency is not managed, so you pay twice to reach the same person.",
      fix: "We size and sequence prospecting and retargeting, and manage audience windows and frequency deliberately.",
    },
  ],
  "google-ads": [
    {
      problem: "Budget runs out, but the enquiries don’t come.",
      cause: "Broad keywords match searches from students, job seekers and DIYers who were never going to buy.",
      fix: "We group keywords by intent and review search terms every week, adding negatives for searches that never convert.",
    },
    {
      problem: "Google reports conversions your team can’t find.",
      cause: "Bidding is trained on inflated or duplicate conversion data, so it chases the wrong clicks.",
      fix: "We fix conversion tracking first, then let bidding learn from real, counted leads and sales.",
    },
    {
      problem: "CPCs keep climbing.",
      cause: "Weak ad relevance and a generic landing page lower quality, which raises what you pay per click.",
      fix: "We match the keyword, the ad and the landing page to the search, so each step answers the same question.",
    },
  ],
  "landing-pages": [
    {
      problem: "Good click-through rate, very few leads.",
      cause: "Ads send people to the homepage or a generic page that doesn’t mention what the ad promised.",
      fix: "We build a focused page per campaign whose headline, offer and next step continue what the ad said.",
    },
    {
      problem: "People start the form but don’t finish it.",
      cause: "Too many fields, unclear next steps and no reason to trust you with their details.",
      fix: "We cut the form to what sales actually needs and place your real proof where doubt appears.",
    },
    {
      problem: "No one knows which page version works better.",
      cause: "Conversions aren’t tracked per page, so changes are judged by opinion.",
      fix: "Tracking is wired in from day one, so every page reports its own leads back to the ad platforms.",
    },
  ],
  cro: [
    {
      problem: "Traffic is steady, conversion rate is flat.",
      cause: "Changes are made on hunches, like button colours, instead of the reasons visitors actually leave.",
      fix: "We find where and why people drop off with analytics and qualitative research, then fix the biggest reasons first.",
    },
    {
      problem: "Tests end with no clear winner.",
      cause: "Too little traffic or too small a change to reach a reliable answer.",
      fix: "We only A/B test when the numbers support it. Otherwise we make research-led changes and compare before and after, honestly.",
    },
    {
      problem: "A full redesign didn’t help.",
      cause: "Sometimes the page is fine and the traffic is wrong.",
      fix: "We check traffic quality before rebuilding a page that might not be the problem.",
    },
  ],
  analytics: [
    {
      problem: "Google, Meta and your CRM all report different numbers.",
      cause: "Duplicate tags, missing events and inconsistent naming, so each tool counts something slightly different.",
      fix: "We audit what fires, remove duplicates and set up clean conversion events named the same way everywhere.",
    },
    {
      problem: "You can’t tell which campaign produced a customer.",
      cause: "Source data is lost between the click, the form and the CRM.",
      fix: "Consistent UTMs, source data saved with every lead, and CRM or offline conversions sent back where feasible.",
    },
    {
      problem: "Ad platforms optimize toward the wrong people.",
      cause: "They learn from whatever conversion data they receive, including bad data.",
      fix: "Accurate events, plus server-side tracking and the Conversions API where appropriate, so they learn from real leads.",
    },
  ],
};

/** One-line "what it fixes" for the services index ledger. */
export const serviceIndexLedger: Record<ServiceSlug, { problem: string; cause: string; fix: string }> = {
  "meta-ads": {
    problem: "Social ads bring clicks, but few buyers.",
    cause: "Campaigns optimize for cheap engagement instead of the conversion that makes money.",
    fix: "Meta Ads structured around the event closest to revenue, with deliberate audience testing.",
  },
  "google-ads": {
    problem: "Search budget goes on searches that never buy.",
    cause: "Broad keywords with no negatives, and bidding trained on bad conversion data.",
    fix: "Google Ads grouped by intent, with weekly search term reviews and bidding on real conversions.",
  },
  "landing-pages": {
    problem: "People click the ad, then leave.",
    cause: "The page doesn’t continue what the ad promised, and the next step isn’t obvious.",
    fix: "Campaign landing pages that match the ad’s offer and make one next step easy.",
  },
  cro: {
    problem: "Conversion rate won’t move.",
    cause: "Changes are guesses, not answers to why visitors actually leave.",
    fix: "CRO based on research and, when traffic allows, reliable tests. Biggest problems first.",
  },
  analytics: {
    problem: "Nobody trusts the numbers.",
    cause: "Broken or duplicated tracking, so every decision is partly a guess.",
    fix: "Analytics & tracking that counts each lead once and shows where it came from.",
  },
};
