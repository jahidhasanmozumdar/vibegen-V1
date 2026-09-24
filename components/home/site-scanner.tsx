"use client";

import { AlertTriangle, ArrowRight, Check, Globe, Info, Loader2, Lock, RotateCcw, Smartphone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { cta } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

/*
 * Instant Funnel Scan. The visitor's page is opened in a real headless Chrome
 * on a phone profile (/api/scan): tags seen on the network, measured speed,
 * the rendered page and a phone screenshot. Free scans are limited per day;
 * past the limit the visitor is offered unlimited scans with a plan.
 */

type Status = "pass" | "warn" | "fail" | "info";
type Group = "Tracking" | "Speed" | "Mobile" | "Conversion" | "Trust" | "Page";
interface ScanCheck {
  id: string;
  group: Group;
  label: string;
  status: Status;
  detail: string;
}
interface Metrics {
  loadMs: number;
  lcpMs: number | null;
  cls: number | null;
  transferKb: number;
  requests: number;
}
interface Result {
  mode: "browser" | "quick";
  host: string;
  score: number;
  checks: ScanCheck[];
  metrics: Metrics | null;
  screenshot: string | null;
  alsoDetected: string[];
}
type ApiResponse =
  | { ok: true; result: Result; remaining: number; limit: number }
  | { ok: false; code: "limit"; error: string; limit: number; resetsInHours: number }
  | { ok: false; code: string; error: string; remaining?: number };

const STEPS = [
  "Opening your page in a real browser",
  "Recording every network request",
  "Checking which tracking tags fire",
  "Measuring speed on a phone",
  "Reading your headline, buttons and forms",
  "Taking a phone screenshot",
];

const GROUPS: Group[] = ["Tracking", "Speed", "Mobile", "Conversion", "Trust", "Page"];

const statusUi: Record<Status, { icon: typeof Check; cls: string; label: string }> = {
  pass: { icon: Check, cls: "bg-[#e7f7ee] text-[#0f7a3d]", label: "Good" },
  warn: { icon: AlertTriangle, cls: "bg-[#fff4e0] text-[#b54708]", label: "Needs attention" },
  fail: { icon: X, cls: "bg-[#fdecea] text-[#b42318]", label: "Problem" },
  info: { icon: Info, cls: "bg-brand-soft text-brand", label: "Note" },
};

function verdict(score: number) {
  if (score >= 80) return { text: "Strong foundation", tone: "#12a150" };
  if (score >= 55) return { text: "Room to grow", tone: "#d97706" };
  return { text: "Likely leaking leads", tone: "#dc2626" };
}

function ScoreRing({ score }: { score: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 72 72" className="size-[72px] shrink-0" aria-hidden="true">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#eef0f3" strokeWidth="7" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={verdict(score).tone} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} transform="rotate(-90 36 36)" />
      <text x="36" y="42" textAnchor="middle" fontSize="19" fontWeight="600" fill="#0a0d14">
        {score}
      </text>
    </svg>
  );
}

const fmtSecs = (ms: number | null) => (ms === null ? "—" : `${(ms / 1000).toFixed(1)}s`);
const fmtWeight = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);

export function SiteScanner() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "scanning" | "done" | "error" | "limit">("idle");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limitInfo, setLimitInfo] = useState<{ limit: number; hours: number } | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  async function runScan(target: string) {
    if (!target.trim()) return;
    setState("scanning");
    setStep(0);
    setResult(null);
    setError("");
    timer.current = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2400);
    try {
      const res = await fetch("/api/scan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: target }) });
      const json = (await res.json()) as ApiResponse;
      if (json.ok) {
        setResult(json.result);
        setRemaining(json.remaining);
        setState("done");
      } else if (json.code === "limit" && "resetsInHours" in json) {
        setLimitInfo({ limit: json.limit, hours: json.resetsInHours });
        setRemaining(0);
        setState("limit");
      } else {
        setError(json.error);
        setState("error");
      }
    } catch {
      setError("We couldn't run the scan. Check your connection and try again.");
      setState("error");
    } finally {
      if (timer.current) clearInterval(timer.current);
    }
  }

  async function scan(e: React.FormEvent) {
    e.preventDefault();
    await runScan(url);
  }

  // Arriving with ?scan=site (e.g. from the hero's scan box): start straight away.
  useEffect(() => {
    const site = new URLSearchParams(window.location.search).get("scan")?.trim().slice(0, 300);
    if (!site) return;
    document.getElementById("scan")?.scrollIntoView({ behavior: "smooth", block: "start" });
    const t = setTimeout(() => {
      setUrl(site);
      void runScan(site);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const reset = () => {
    setResult(null);
    setState(remaining === 0 ? "limit" : "idle");
  };

  const issues = result ? result.checks.filter((c) => c.status === "warn" || c.status === "fail").length : 0;

  return (
    <div className="rounded-[28px] border border-hair bg-white p-5 shadow-[0_1px_2px_rgb(10_13_20/0.04),0_40px_80px_-40px_rgb(10_13_20/0.28)] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em]">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#12a150] opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#12a150]" />
          </span>
          Instant Funnel Scan
        </p>
        <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-medium", remaining === 0 ? "bg-[#fff4e0] text-[#b54708]" : "bg-[#e7f7ee] text-[#0f7a3d]")}>
          {remaining === null ? "Free · real browser test" : `${remaining} free scan${remaining === 1 ? "" : "s"} left today`}
        </span>
      </div>

      {/* ---------- limit reached: upgrade ---------- */}
      {state === "limit" ? (
        <div className="mt-5">
          <div className="rounded-[20px] bg-fg p-6 text-white sm:p-8">
            <span className="grid size-10 place-items-center rounded-full bg-white/10">
              <Lock className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-[20px] font-semibold tracking-[-0.025em]">You&rsquo;ve used your {limitInfo?.limit ?? 3} free scans today.</p>
            <p className="mt-2 text-[14.5px] leading-relaxed text-white/70">
              Clients on any VibeGen plan get unlimited scans of every landing page, plus a person reviewing the results and fixing what the
              scan finds.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link href="/pricing" className="pm-btn bg-white text-fg hover:bg-white/90">
                Get unlimited with a plan
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href={cta.secondary.href} className="pm-btn text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.3)] hover:bg-white/10">
                {cta.secondary.label}
              </Link>
            </div>
          </div>
          <p className="mt-4 text-[13px] text-fg-3">
            Free scans reset in about {limitInfo?.hours ?? 24} hour{limitInfo?.hours === 1 ? "" : "s"}. Or{" "}
            <Link href={cta.primary.href} className="pm-link">
              request a free growth audit
            </Link>{" "}
            and a person will review your site.
          </p>
        </div>
      ) : null}

      {/* ---------- idle / scanning / error ---------- */}
      {state === "idle" || state === "scanning" || state === "error" ? (
        <>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-fg-2">
            We open your page in a real browser, like a visitor on a phone, and show what&rsquo;s actually working. Free, about 20 seconds.
          </p>
          <form onSubmit={scan} className="mt-6 flex flex-col gap-2.5 sm:flex-row" noValidate>
            <label htmlFor="scan-url" className="sr-only">
              Your website address
            </label>
            <div className="relative flex-1">
              <Globe className="pointer-events-none absolute top-1/2 left-4.5 size-4.5 -translate-y-1/2 text-fg-3" aria-hidden="true" />
              <input
                id="scan-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourcompany.com"
                inputMode="url"
                autoComplete="url"
                disabled={state === "scanning"}
                className="h-14 w-full rounded-full border border-[#d9dbe1] bg-white pr-4 pl-11 text-[16px] outline-none placeholder:text-fg-3 focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:opacity-60"
              />
            </div>
            <button type="submit" disabled={state === "scanning" || !url.trim()} className="pm-btn pm-btn-dark h-14 px-8 text-[15.5px] disabled:cursor-not-allowed disabled:opacity-50">
              {state === "scanning" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              {state === "scanning" ? "Scanning…" : "Scan my site"}
            </button>
          </form>

          {state === "scanning" ? (
            <div className="mt-6" aria-live="polite">
              <ol className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {STEPS.map((s, i) => (
                  <li key={s} className={cn("flex items-center gap-3 text-[14px] transition-opacity", i > step ? "opacity-35" : "opacity-100")}>
                    <span className={cn("grid size-5 shrink-0 place-items-center rounded-full", i < step ? "bg-[#12a150] text-white" : "border border-hair")}>
                      {i < step ? <Check className="size-3" strokeWidth={3} /> : i === step ? <Loader2 className="size-3 animate-spin text-brand" /> : null}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[12.5px] text-fg-3">A real page load takes 10–25 seconds.</p>
            </div>
          ) : (
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-3">
              {[
                { t: "Tracking that fires", d: "GA4, Google Ads, Meta Pixel, GTM, consent" },
                { t: "Real phone speed", d: "Load time, page weight, layout shifts" },
                { t: "What visitors see", d: "Headline, first-screen button, form length" },
              ].map((x) => (
                <li key={x.t} className="rounded-[14px] bg-soft p-3.5">
                  <p className="text-[13.5px] font-medium">{x.t}</p>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-fg-3">{x.d}</p>
                </li>
              ))}
            </ul>
          )}

          {state === "error" ? (
            <p role="alert" className="mt-4 rounded-[12px] bg-[#fdecea] px-4 py-3 text-[14px] text-[#b42318]">
              {error}
            </p>
          ) : null}

          <p className="mt-5 text-[12.5px] text-fg-3">We visit your public page once. Nothing is stored.</p>
        </>
      ) : null}

      {/* ---------- result ---------- */}
      {state === "done" && result ? (
        <div aria-live="polite" className="mt-5 grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
          <div>
          <div className="flex items-center gap-4 rounded-[16px] bg-soft p-4">
            <ScoreRing score={result.score} />
            <div className="min-w-0">
              <p className="truncate text-[13px] text-fg-3">{result.host}</p>
              <p className="text-[18px] font-semibold tracking-[-0.02em]" style={{ color: verdict(result.score).tone }}>
                {verdict(result.score).text}
              </p>
              <p className="text-[13.5px] text-fg-2">{issues === 0 ? "No obvious issues on this page." : `${issues} thing${issues === 1 ? "" : "s"} worth fixing.`}</p>
            </div>
          </div>

          {result.metrics ? (
            <div className="mt-3 grid grid-cols-[112px_1fr] gap-3 lg:grid-cols-1">
              {result.screenshot ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URL from the scan, not an optimizable asset
                <img src={result.screenshot} alt={`How ${result.host} looks on a phone`} className="h-[224px] w-[112px] rounded-[14px] border border-hair object-cover object-top lg:h-[380px] lg:w-full" />
              ) : (
                <span className="grid h-[224px] place-items-center rounded-[14px] bg-soft lg:h-[380px]">
                  <Smartphone className="size-5 text-fg-3" />
                </span>
              )}
              <dl className="grid grid-cols-2 gap-2">
                {[
                  { k: "Main content", v: fmtSecs(result.metrics.lcpMs) },
                  { k: "Full load", v: fmtSecs(result.metrics.loadMs) },
                  { k: "Page weight", v: fmtWeight(result.metrics.transferKb) },
                  { k: "Requests", v: String(result.metrics.requests) },
                ].map((m) => (
                  <div key={m.k} className="rounded-[12px] border border-hair p-2.5">
                    <dt className="text-[11.5px] text-fg-3">{m.k}</dt>
                    <dd className="mt-0.5 text-[16px] font-semibold tracking-tight tabular-nums">{m.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          </div>

          <div className="min-w-0">
          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            {GROUPS.filter((g) => result.checks.some((c) => c.group === g)).map((group) => (
              <div key={group}>
                <p className="pm-eyebrow">{group}</p>
                <ul className="mt-2 space-y-1.5">
                  {result.checks
                    .filter((c) => c.group === group)
                    .map((c) => {
                      const ui = statusUi[c.status];
                      const Icon = ui.icon;
                      return (
                        <li key={c.id} className="flex gap-3 rounded-[12px] border border-hair p-3">
                          <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full", ui.cls)}>
                            <Icon className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                            <span className="sr-only">{ui.label}:</span>
                          </span>
                          <div className="min-w-0">
                            <p className="text-[14px] font-medium">{c.label}</p>
                            <p className="mt-0.5 text-[13px] leading-snug text-fg-2">{c.detail}</p>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
            {result.alsoDetected.length > 0 ? (
              <div className="md:col-span-2">
                <p className="pm-eyebrow">Also running on this page</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {result.alsoDetected.map((t) => (
                    <li key={t} className="rounded-full border border-hair px-2.5 py-1 text-[12.5px] text-fg-2">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Link href={`/free-growth-audit?website=${encodeURIComponent(result.host)}`} className="pm-btn pm-btn-dark sm:flex-1">
              Get the full audit from a person
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <button type="button" onClick={reset} className="pm-btn pm-btn-light">
              <RotateCcw className="size-4" aria-hidden="true" />
              Scan another
            </button>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-fg-3">
            {result.mode === "browser"
              ? "Measured in a real Chrome browser on a phone profile, from our server. Your visitors' speed depends on their device and network. Tags that wait for cookie consent may not fire in an automated visit."
              : "Quick check of your page source (the real-browser test was unavailable). Some tags load from other scripts, so the full audit confirms everything."}
          </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
