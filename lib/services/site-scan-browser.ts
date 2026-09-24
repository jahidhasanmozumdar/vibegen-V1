import "server-only";

import { existsSync } from "node:fs";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { Browser } from "puppeteer-core";

import { serverEnv } from "@/lib/config/server-env";

/*
 * Real-browser engine for the Instant Funnel Scan.
 *
 * Opens the page in headless Chrome on a mobile profile and records what really
 * happens: every network request (so tags loaded by other scripts are seen),
 * Core Web Vitals from the browser's own PerformanceObserver, transfer size,
 * the rendered DOM (headline, forms, CTAs above the fold, sideways scroll) and
 * a phone screenshot.
 *
 * SSRF: every request the page makes, including redirects and sub-resources,
 * is intercepted and aborted unless its host resolves to a public address.
 */

export interface BrowserCapture {
  finalUrl: string;
  status: number;
  loadMs: number;
  lcpMs: number | null;
  fcpMs: number | null;
  cls: number | null;
  transferKb: number;
  requests: number;
  requestUrls: string[];
  dom: {
    title: string | null;
    description: string | null;
    h1: string | null;
    viewport: boolean;
    sidewaysScroll: boolean;
    forms: number;
    maxFields: number;
    ctaAboveFold: string | null;
    telLink: boolean;
    imagesMissingAlt: number;
    images: number;
  };
  screenshot: string; // data:image/jpeg;base64,…
}

const CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

export function chromePath(): string | null {
  const configured = serverEnv().chromeExecutablePath;
  if (configured) return existsSync(configured) ? configured : null;
  return CANDIDATES.find((p) => existsSync(p)) ?? null;
}

/* ---- shared browser (survives dev HMR), max 2 scans at once ---- */

const G = globalThis as unknown as { __vgScanBrowser?: Promise<Browser>; __vgScanSlots?: number; __vgScanQueue?: (() => void)[] };
const MAX_CONCURRENT = 2;

async function getBrowser(): Promise<Browser> {
  const existing = G.__vgScanBrowser ? await G.__vgScanBrowser.catch(() => null) : null;
  if (existing?.connected) return existing;
  const executablePath = chromePath();
  if (!executablePath) throw new Error("no-browser");
  const puppeteer = await import("puppeteer-core");
  G.__vgScanBrowser = puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--disable-gpu", "--disable-dev-shm-usage", "--no-first-run", "--mute-audio", "--disable-extensions", ...(process.platform === "linux" ? ["--no-sandbox"] : [])],
  });
  return G.__vgScanBrowser;
}

async function acquire() {
  G.__vgScanSlots ??= 0;
  G.__vgScanQueue ??= [];
  if (G.__vgScanSlots < MAX_CONCURRENT) {
    G.__vgScanSlots++;
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("busy")), 20_000);
    G.__vgScanQueue!.push(() => {
      clearTimeout(t);
      resolve();
    });
  });
}
function release() {
  const next = G.__vgScanQueue?.shift();
  if (next) next();
  else G.__vgScanSlots = Math.max(0, (G.__vgScanSlots ?? 1) - 1);
}

/* ---- SSRF guard for every request the page makes ---- */

function privateIp(ip: string) {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
  }
  const x = ip.toLowerCase();
  const mapped = x.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return privateIp(mapped[1]);
  return x === "::" || x === "::1" || /^f[cd]/.test(x) || /^fe[89ab]/.test(x);
}

function makeHostGuard() {
  const cache = new Map<string, Promise<boolean>>();
  return (hostname: string) => {
    const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
    let p = cache.get(host);
    if (!p) {
      p = isIP(host)
        ? Promise.resolve(!privateIp(host))
        : /(^|\.)(localhost|local|internal)$/.test(host)
          ? Promise.resolve(false)
          : lookup(host, { all: true, verbatim: true })
              .then((a) => a.length > 0 && a.every((x) => !privateIp(x.address)))
              .catch(() => false);
      cache.set(host, p);
    }
    return p;
  };
}

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1 VibeGenFunnelScan/1.0";

export async function captureInBrowser(url: string): Promise<BrowserCapture> {
  await acquire();
  const browser = await getBrowser().catch((e) => {
    release();
    throw e;
  });
  const context = await browser.createBrowserContext();
  try {
    const page = await context.newPage();
    await page.setUserAgent({ userAgent: MOBILE_UA });
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    page.setDefaultTimeout(20_000);
    page.on("dialog", (d) => void d.dismiss().catch(() => {}));

    const allowed = makeHostGuard();
    const requestUrls: string[] = [];
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.isInterceptResolutionHandled()) return;
      let u: URL;
      try {
        u = new URL(req.url());
      } catch {
        void req.abort("blockedbyclient").catch(() => {});
        return;
      }
      if (u.protocol === "data:" || u.protocol === "blob:") {
        void req.continue().catch(() => {});
        return;
      }
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        void req.abort("blockedbyclient").catch(() => {});
        return;
      }
      void allowed(u.hostname).then((ok) => {
        if (ok) {
          if (requestUrls.length < 1500) requestUrls.push(req.url());
          return req.continue();
        }
        return req.abort("blockedbyclient");
      }).catch(() => {});
    });

    let transferBytes = 0;
    const cdp = await page.createCDPSession();
    await cdp.send("Network.enable");
    cdp.on("Network.loadingFinished", (e) => {
      transferBytes += e.encodedDataLength;
    });

    // Web-vitals collectors installed before any page script runs.
    await page.evaluateOnNewDocument(() => {
      const w = window as unknown as { __vg: { lcp: number | null; cls: number } };
      w.__vg = { lcp: null, cls: 0 };
      try {
        new PerformanceObserver((l) => {
          const last = l.getEntries().at(-1);
          if (last) w.__vg.lcp = last.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) w.__vg.cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
      } catch {}
    });

    const t0 = Date.now();
    const res = await page.goto(url, { waitUntil: "load", timeout: 20_000 });
    const loadMs = Date.now() - t0;
    // Give tags and consent banners a moment to fire, like a real visitor would.
    await page.waitForNetworkIdle({ idleTime: 800, timeout: 6000 }).catch(() => {});

    const metrics = await page.evaluate(() => {
      const w = window as unknown as { __vg?: { lcp: number | null; cls: number } };
      const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null;
      return { lcp: w.__vg?.lcp ?? null, cls: w.__vg?.cls ?? null, fcp };
    });

    const dom = await page.evaluate(() => {
      const text = (el: Element | null) => (el?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160) || null;
      const visible = (el: Element) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
      };
      let maxFields = 0;
      const forms = Array.from(document.querySelectorAll("form"));
      for (const f of forms) {
        const fields = Array.from(f.querySelectorAll("input, select, textarea")).filter((el) => {
          const t = (el as HTMLInputElement).type;
          return !["hidden", "submit", "button", "image", "reset"].includes(t) && visible(el);
        }).length;
        maxFields = Math.max(maxFields, fields);
      }
      const ctaRe = /\b(get|book|start|quote|call|contact|buy|shop|order|try|demo|sign ?up|free|schedule|request|apply|enquire|join)\b/i;
      const cta = Array.from(document.querySelectorAll("a, button"))
        .filter((el) => {
          const r = (el as HTMLElement).getBoundingClientRect();
          return visible(el) && r.top < window.innerHeight && r.bottom > 0 && ctaRe.test(el.textContent ?? "");
        })
        .map((el) => (el.textContent ?? "").replace(/\s+/g, " ").trim())
        .find((t) => t.length > 1 && t.length < 50);
      const imgs = Array.from(document.images);
      return {
        title: document.title.trim().slice(0, 160) || null,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content")?.trim().slice(0, 200) || null,
        h1: text(document.querySelector("h1")),
        viewport: !!document.querySelector('meta[name="viewport"]'),
        sidewaysScroll: document.documentElement.scrollWidth > window.innerWidth + 4,
        forms: forms.length,
        maxFields,
        ctaAboveFold: cta ?? null,
        telLink: !!document.querySelector('a[href^="tel:"]'),
        imagesMissingAlt: imgs.filter((i) => !i.hasAttribute("alt") && i.naturalWidth > 40).length,
        images: imgs.length,
      };
    });

    const shot = await page.screenshot({ type: "jpeg", quality: 55, encoding: "base64", captureBeyondViewport: false });

    return {
      finalUrl: page.url(),
      status: res?.status() ?? 0,
      loadMs,
      lcpMs: metrics.lcp !== null ? Math.round(metrics.lcp) : null,
      fcpMs: metrics.fcp !== null ? Math.round(metrics.fcp) : null,
      cls: metrics.cls !== null ? Math.round(metrics.cls * 1000) / 1000 : null,
      transferKb: Math.round(transferBytes / 1024),
      requests: requestUrls.length,
      requestUrls,
      dom,
      screenshot: `data:image/jpeg;base64,${shot}`,
    };
  } finally {
    await context.close().catch(() => {});
    release();
  }
}
