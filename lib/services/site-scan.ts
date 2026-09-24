import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { captureInBrowser, type BrowserCapture } from "./site-scan-browser";

/*
 * Instant Funnel Scan. Primary path: a real headless-Chrome visit on a phone
 * profile (./site-scan-browser.ts), analysed from the network requests,
 * measured web vitals and rendered DOM. Fallback when no browser is installed:
 * a raw-HTML read (quickScan). Nothing is stored.
 *
 * SSRF safety: http(s) on default ports only, hostnames must resolve to public
 * addresses (re-checked on every redirect hop and, in the browser, on every
 * sub-request), timeouts and size caps on both paths.
 */

export type CheckStatus = "pass" | "warn" | "fail" | "info";

export interface ScanCheck {
  id: string;
  group: "Tracking" | "Speed" | "Mobile" | "Conversion" | "Trust" | "Page";
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface ScanMetrics {
  loadMs: number;
  lcpMs: number | null;
  fcpMs: number | null;
  cls: number | null;
  transferKb: number;
  requests: number;
}

export interface ScanResult {
  /** "browser" = real headless Chrome visit; "quick" = raw-HTML fallback. */
  mode: "browser" | "quick";
  url: string;
  host: string;
  score: number;
  responseMs: number;
  htmlKb: number;
  title: string | null;
  h1: string | null;
  checks: ScanCheck[];
  jsRendered: boolean;
  metrics: ScanMetrics | null;
  screenshot: string | null;
  alsoDetected: string[];
}

export class ScanError extends Error {
  constructor(
    message: string,
    public readonly userMessage: string,
  ) {
    super(message);
  }
}

const MAX_BYTES = 2.5 * 1024 * 1024;
const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 4;

function isPrivateV4(ip: string) {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateV6(ip: string) {
  const x = ip.toLowerCase();
  if (x === "::" || x === "::1") return true;
  if (x.startsWith("fc") || x.startsWith("fd") || x.startsWith("fe8") || x.startsWith("fe9") || x.startsWith("fea") || x.startsWith("feb")) return true;
  const mapped = x.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mapped ? isPrivateV4(mapped[1]) : false;
}

function isPrivateIp(ip: string) {
  return isIP(ip) === 4 ? isPrivateV4(ip) : isPrivateV6(ip);
}

export function normalizeUrl(input: string): URL {
  const raw = input.trim();
  if (!raw || raw.length > 300) throw new ScanError("bad url", "Enter a website address, like yourcompany.com.");
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    throw new ScanError("bad url", "That doesn't look like a website address. Try yourcompany.com.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new ScanError("protocol", "Only http and https websites can be scanned.");
  if (url.username || url.password) throw new ScanError("creds", "Remove the username and password from the address.");
  if (url.port && url.port !== "80" && url.port !== "443") throw new ScanError("port", "Only standard website ports can be scanned.");
  if (!url.hostname.includes(".") || /(^|\.)(localhost|local|internal|lan|home|corp)$/i.test(url.hostname)) {
    throw new ScanError("host", "Enter a public website address.");
  }
  return url;
}

async function assertPublicHost(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) {
    if (isPrivateIp(host)) throw new ScanError("private ip", "Enter a public website address.");
    return;
  }
  let addrs: { address: string }[];
  try {
    addrs = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new ScanError("dns", "We couldn't find that website. Check the address and try again.");
  }
  if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) throw new ScanError("private dns", "Enter a public website address.");
}

async function fetchPublic(start: URL): Promise<{ finalUrl: URL; html: string; responseMs: number }> {
  let url = start;
  const t0 = Date.now();
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHost(url.hostname);
    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; VibeGenFunnelScan/1.0; +https://vibegen.studio)",
          accept: "text/html,application/xhtml+xml",
        },
      });
    } catch {
      throw new ScanError("fetch", "We couldn't reach that website in time. Check the address and try again.");
    }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new ScanError("redirect", "That website redirected without a destination.");
      const next = new URL(loc, url);
      if (next.protocol !== "https:" && next.protocol !== "http:") throw new ScanError("redirect proto", "That website redirected somewhere we can't scan.");
      url = next;
      continue;
    }
    const responseMs = Date.now() - t0;
    if (!res.ok) throw new ScanError(`status ${res.status}`, `That website answered with an error (${res.status}). Try your main page or a landing page.`);
    const type = res.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml/i.test(type)) throw new ScanError("type", "That address isn't a web page. Try your homepage or a landing page.");

    const reader = res.body?.getReader();
    if (!reader) throw new ScanError("body", "That page came back empty.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
    const html = new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks));
    return { finalUrl: url, html, responseMs };
  }
  throw new ScanError("redirects", "That website redirected too many times.");
}

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

function firstMatch(html: string, re: RegExp) {
  const m = html.match(re);
  return m ? decode(m[1]).slice(0, 160) || null : null;
}

/** Largest number of visible fields in any single <form>. */
function maxFormFields(html: string) {
  const forms = html.match(/<form[\s\S]*?<\/form>/gi) ?? [];
  let max = 0;
  for (const f of forms) {
    const inputs = (f.match(/<input\b[^>]*>/gi) ?? []).filter((i) => !/type\s*=\s*["']?(hidden|submit|button|image|reset)/i.test(i)).length;
    const others = (f.match(/<(select|textarea)\b/gi) ?? []).length;
    max = Math.max(max, inputs + others);
  }
  return { forms: forms.length, fields: max };
}

/** Fallback when no browser is available: reads the raw HTML only. */
async function quickScan(start: URL): Promise<ScanResult> {
  const { finalUrl, html, responseMs } = await fetchPublic(start);

  const has = (re: RegExp) => re.test(html);
  const gtm = has(/googletagmanager\.com\/gtm\.js|["']GTM-[A-Z0-9]{4,}["']/i);
  const ga4 = has(/gtag\/js\?id=G-|gtag\(\s*["']config["']\s*,\s*["']G-[A-Z0-9]+/i);
  const gads = has(/AW-\d{6,}/);
  const pixel = has(/connect\.facebook\.net\/[^"']*fbevents\.js|fbq\(\s*["']init["']/i);
  const consent = has(/cookiebot|onetrust|cookieyes|termly|iubenda|usercentrics|osano|didomi|complianz|cookie-?law|gtag\(\s*["']consent["']/i);
  const viewport = has(/<meta[^>]+name=["']viewport["']/i);
  const https = finalUrl.protocol === "https:";
  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const h1 = firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const { forms, fields } = maxFormFields(html);
  const htmlKb = Math.round(Buffer.byteLength(html) / 1024);
  const bodyText = decode(html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " "));
  const jsRendered = bodyText.length < 400;

  // Tags are often injected by a loader script, invisible in raw HTML. Name the loader when we can see one.
  const loader = gtm
    ? "Google Tag Manager"
    : has(/cdn\.segment\.com|analytics\.js\/v1/i)
      ? "Segment"
      : has(/tealium/i)
        ? "Tealium"
        : has(/zaraz/i)
          ? "Cloudflare Zaraz"
          : has(/rudderstack|rudderlabs/i)
            ? "RudderStack"
            : has(/\bdataLayer\b/)
              ? "a data layer"
              : null;
  const notSeen = (what: string) =>
    loader
      ? `Not in the page source, but it may load through ${loader}.`
      : `Not found in the page source. ${what}`;

  const checks: ScanCheck[] = [
    {
      id: "gtm",
      group: "Tracking",
      label: "Google Tag Manager",
      status: gtm ? "pass" : loader ? "info" : "warn",
      detail: gtm
        ? "Installed. Tags can be managed without code changes."
        : loader
          ? `Not found, but tags appear to load through ${loader}.`
          : "Not found in the page source. Without a tag manager, every tracking change needs a developer.",
    },
    {
      id: "ga4",
      group: "Tracking",
      label: "Google Analytics 4",
      status: ga4 ? "pass" : loader ? "info" : "warn",
      detail: ga4 ? "GA4 tag found on the page." : notSeen("Without GA4 you can't see which traffic turns into leads."),
    },
    {
      id: "gads",
      group: "Tracking",
      label: "Google Ads conversion tag",
      status: gads ? "pass" : loader ? "info" : "warn",
      detail: gads ? "Google Ads tag found." : notSeen("Without it, Google can't learn which clicks become leads."),
    },
    {
      id: "pixel",
      group: "Tracking",
      label: "Meta Pixel",
      status: pixel ? "pass" : loader ? "info" : "warn",
      detail: pixel ? "Meta Pixel found." : notSeen("Without it, Meta can't optimize toward real leads."),
    },
    {
      id: "consent",
      group: "Tracking",
      label: "Cookie consent",
      status: consent ? "pass" : "warn",
      detail: consent
        ? "A consent tool or Consent Mode was found."
        : "No consent tool found in the page source. It matters for UK visitors and Google's Consent Mode.",
    },
    {
      id: "https",
      group: "Page",
      label: "Secure connection (HTTPS)",
      status: https ? "pass" : "fail",
      detail: https ? "The page loads over HTTPS." : "The page isn't served over HTTPS. Browsers mark it as not secure.",
    },
    {
      id: "viewport",
      group: "Page",
      label: "Mobile-ready",
      status: viewport ? "pass" : "fail",
      detail: viewport ? "The page is set up for phones." : "No mobile viewport tag. On phones the page may render zoomed-out.",
    },
    {
      id: "speed",
      group: "Page",
      label: "Server response",
      status: responseMs < 800 ? "pass" : responseMs < 1800 ? "warn" : "fail",
      detail: `${(responseMs / 1000).toFixed(2)}s to respond${responseMs < 800 ? ". Quick." : ". Paid visitors often leave before slow pages finish loading."}`,
    },
    {
      id: "headline",
      group: "Conversion",
      label: "Clear headline",
      status: h1 ? (h1.split(" ").length <= 14 ? "pass" : "warn") : "warn",
      detail: h1 ? `Visitors first read: “${h1}”` : "No main headline (H1) found. Visitors should see what you offer in one line.",
    },
    {
      id: "meta",
      group: "Conversion",
      label: "Search snippet",
      status: title && description ? "pass" : "warn",
      detail: title && description ? "Title and description are set." : "Missing a title or description, so search results show whatever Google picks.",
    },
    {
      id: "form",
      group: "Conversion",
      label: "Lead form length",
      status: forms === 0 ? "info" : fields <= 5 ? "pass" : fields <= 8 ? "warn" : "fail",
      detail:
        forms === 0
          ? "No form on this page. Scan the landing page your ads send people to."
          : `Longest form asks for ${fields} field${fields === 1 ? "" : "s"}.${fields > 5 ? " Every extra field costs leads, especially on mobile." : " Short and easy."}`,
    },
  ];

  const weight: Record<CheckStatus, number> = { pass: 1, info: 0.6, warn: 0.4, fail: 0 };
  const score = Math.round((checks.reduce((s, c) => s + weight[c.status], 0) / checks.length) * 100);

  return { mode: "quick", url: finalUrl.toString(), host: finalUrl.hostname, score, responseMs, htmlKb, title, h1, checks, jsRendered, metrics: null, screenshot: null, alsoDetected: [] };
}

/* ------------------------------------------------------------------ */
/* Real-browser analysis                                               */
/* ------------------------------------------------------------------ */

const any = (urls: string[], re: RegExp) => urls.some((u) => re.test(u));

const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

const GA4_HIT = /(google-analytics\.com|analytics\.google\.com)\/g\/collect/;

function analyze(cap: BrowserCapture): ScanResult {
  const u = cap.requestUrls;
  const final = new URL(cap.finalUrl);

  const gtm = any(u, /googletagmanager\.com\/gtm\.js/);
  const gtagScript = any(u, /googletagmanager\.com\/gtag\/js\?id=(G|AW|GT)-/);
  const ga4Hits = u.filter((x) => GA4_HIT.test(x));
  const ga4Hit = ga4Hits.length > 0;
  const consentMode = ga4Hits.some((x) => /[?&](gcs|gcd)=/.test(x));
  const adsTag = any(u, /googleadservices\.com\/pagead|googleads\.g\.doubleclick\.net\/pagead|gtag\/js\?id=AW-|google\.com\/(pagead|ccm)\/|\/pagead\/(viewthrough)?conversion/);
  const pixelScript = any(u, /connect\.facebook\.net\/[^?]*(fbevents\.js|signals)/);
  const pixelHit = any(u, /facebook\.com\/tr[/?]/);
  const cmp = any(u, /cookiebot|onetrust|cookielaw|cookieyes|usercentrics|didomi|iubenda|termly|osano|complianz|consentmanager|quantcast|trustarc/);

  const also: [RegExp, string][] = [
    [/snap\.licdn\.com|px\.ads\.linkedin\.com/, "LinkedIn Insight"],
    [/analytics\.tiktok\.com/, "TikTok Pixel"],
    [/clarity\.ms/, "Microsoft Clarity"],
    [/bat\.bing\.com/, "Microsoft Ads (UET)"],
    [/hotjar\.(com|io)/, "Hotjar"],
    [/cdn\.segment\.(com|io)/, "Segment"],
    [/js\.hs-scripts\.com|js\.hs-analytics\.net/, "HubSpot"],
    [/static\.klaviyo\.com/, "Klaviyo"],
    [/sc-static\.net|tr\.snapchat\.com/, "Snap Pixel"],
    [/ct\.pinterest\.com|s\.pinimg\.com\/ct/, "Pinterest Tag"],
    [/intercom(cdn)?\.(io|com)/, "Intercom"],
  ];
  const alsoDetected = also.filter(([re]) => any(u, re)).map(([, name]) => name);

  const { dom } = cap;
  const lcp = cap.lcpMs;
  const mb = cap.transferKb / 1024;

  const checks: ScanCheck[] = [
    {
      id: "ga4",
      group: "Tracking",
      label: "Google Analytics 4",
      status: ga4Hit ? "pass" : gtagScript || gtm ? "warn" : "fail",
      detail: ga4Hit
        ? `Sending data. We saw ${ga4Hits.length} GA4 hit${ga4Hits.length === 1 ? "" : "s"} while the page loaded.`
        : gtagScript || gtm
          ? "The tag loads but sent no data during our visit. It may wait for cookie consent, or it may be misconfigured."
          : "No GA4 activity during a real visit. You can't see which traffic turns into leads.",
    },
    {
      id: "gtm",
      group: "Tracking",
      label: "Google Tag Manager",
      status: gtm ? "pass" : "warn",
      detail: gtm ? "Loaded. Tags can be managed without code changes." : "Not loaded. Every tracking change needs a developer.",
    },
    {
      id: "gads",
      group: "Tracking",
      label: "Google Ads tag",
      status: adsTag ? "pass" : "warn",
      detail: adsTag ? "Google Ads tag active." : "No Google Ads tag fired. Google can't learn which clicks turn into leads.",
    },
    {
      id: "pixel",
      group: "Tracking",
      label: "Meta Pixel",
      status: pixelHit ? "pass" : "warn",
      detail: pixelHit
        ? "Firing. Meta receives page events."
        : pixelScript
          ? "The Pixel script loads but sent no event during our visit. It may be waiting for consent."
          : "No Meta Pixel activity. Meta can't optimize your ads toward real leads.",
    },
    {
      id: "consent",
      group: "Tracking",
      label: "Cookie consent",
      status: cmp || consentMode ? "pass" : "warn",
      detail:
        cmp && consentMode
          ? "Consent tool found and Google Consent Mode is active."
          : cmp
            ? "A consent tool is loaded."
            : consentMode
              ? "Google Consent Mode signals are present."
              : "No consent tool detected. It matters for UK visitors and Google's Consent Mode.",
    },
    {
      id: "lcp",
      group: "Speed",
      label: "Main content visible (LCP)",
      status: lcp === null ? "info" : lcp <= 2500 ? "pass" : lcp <= 4000 ? "warn" : "fail",
      detail:
        lcp === null
          ? "The browser couldn't measure this page's main content."
          : `${secs(lcp)} on a phone profile. Google's target is under 2.5s.${lcp > 2500 ? " Paid visitors leave while they wait." : ""}`,
    },
    {
      id: "weight",
      group: "Speed",
      label: "Page weight",
      status: mb <= 2 ? "pass" : mb <= 4 ? "warn" : "fail",
      detail: `${mb >= 1 ? `${mb.toFixed(1)} MB` : `${cap.transferKb} KB`} across ${cap.requests} requests.${mb > 2 ? " Heavy on mobile data." : ""}`,
    },
    {
      id: "cls",
      group: "Speed",
      label: "Layout stability (CLS)",
      status: cap.cls === null ? "info" : cap.cls <= 0.1 ? "pass" : cap.cls <= 0.25 ? "warn" : "fail",
      detail:
        cap.cls === null
          ? "Not measurable on this page."
          : `${cap.cls} (target under 0.1).${cap.cls > 0.1 ? " Content jumps while loading, which causes mis-taps." : " Content stays put."}`,
    },
    {
      id: "mobile",
      group: "Mobile",
      label: "Fits the phone screen",
      status: dom.viewport && !dom.sidewaysScroll ? "pass" : "fail",
      detail: !dom.viewport
        ? "No mobile viewport. The page renders zoomed-out on phones."
        : dom.sidewaysScroll
          ? "The page scrolls sideways on a phone. Something is too wide."
          : "No sideways scrolling on a phone.",
    },
    {
      id: "cta",
      group: "Conversion",
      label: "Call to action on the first screen",
      status: dom.ctaAboveFold ? "pass" : "fail",
      detail: dom.ctaAboveFold
        ? `Visitors see “${dom.ctaAboveFold}” without scrolling.`
        : "No clear action button on the first phone screen. Visitors have to hunt for the next step.",
    },
    {
      id: "headline",
      group: "Conversion",
      label: "Headline",
      status: dom.h1 ? (dom.h1.split(" ").length <= 14 ? "pass" : "warn") : "warn",
      detail: dom.h1 ? `Visitors first read: “${dom.h1}”` : "No main headline (H1). Visitors should see what you offer in one line.",
    },
    {
      id: "form",
      group: "Conversion",
      label: "Lead form length",
      status: dom.forms === 0 ? "info" : dom.maxFields <= 5 ? "pass" : dom.maxFields <= 8 ? "warn" : "fail",
      detail:
        dom.forms === 0
          ? "No form on this page. Scan the landing page your ads send people to."
          : `The longest form asks for ${dom.maxFields} field${dom.maxFields === 1 ? "" : "s"}.${dom.maxFields > 5 ? " Every extra field costs leads, especially on mobile." : " Short and easy."}`,
    },
    {
      id: "seo",
      group: "Trust",
      label: "HTTPS and search snippet",
      status: final.protocol !== "https:" ? "fail" : dom.title && dom.description ? "pass" : "warn",
      detail:
        final.protocol !== "https:"
          ? "Not served over HTTPS. Browsers mark the page as not secure."
          : dom.title && dom.description
            ? "Secure, with a title and description for search results."
            : "Missing a title or meta description, so search results show whatever Google picks.",
    },
  ];

  const weight: Record<CheckStatus, number> = { pass: 1, info: 0.7, warn: 0.4, fail: 0 };
  const score = Math.round((checks.reduce((sum, c) => sum + weight[c.status], 0) / checks.length) * 100);

  return {
    mode: "browser",
    url: cap.finalUrl,
    host: final.hostname,
    score,
    responseMs: cap.loadMs,
    htmlKb: cap.transferKb,
    title: dom.title,
    h1: dom.h1,
    checks,
    jsRendered: false,
    metrics: { loadMs: cap.loadMs, lcpMs: cap.lcpMs, fcpMs: cap.fcpMs, cls: cap.cls, transferKb: cap.transferKb, requests: cap.requests },
    screenshot: cap.screenshot,
    alsoDetected,
  };
}

/** Real-browser scan when Chrome is available; raw-HTML scan otherwise. */
export async function scanSite(input: string): Promise<ScanResult> {
  const start = normalizeUrl(input);
  await assertPublicHost(start.hostname);
  try {
    const cap = await captureInBrowser(start.toString());
    if (cap.status >= 400) {
      throw new ScanError(`status ${cap.status}`, `That website answered with an error (${cap.status}). Try your main page or a landing page.`);
    }
    return analyze(cap);
  } catch (err) {
    if (err instanceof ScanError) throw err;
    const msg = err instanceof Error ? err.message : "";
    if (msg === "busy") throw new ScanError("busy", "Our scanner is busy right now. Please try again in a minute.");
    if (msg === "no-browser") return quickScan(start);
    if (/ERR_NAME_NOT_RESOLVED|ERR_CONNECTION|ERR_ADDRESS|ERR_BLOCKED/i.test(msg)) {
      throw new ScanError("unreachable", "We couldn't open that website. Check the address and try again.");
    }
    if (/timeout/i.test(msg)) {
      throw new ScanError("timeout", "That website took over 20 seconds to load. That alone costs paid visitors.");
    }
    console.error("[scan] browser capture failed", err);
    return quickScan(start);
  }
}
