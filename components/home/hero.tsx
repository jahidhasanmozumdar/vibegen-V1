import { ArrowRight, Globe } from "lucide-react";
import Link from "next/link";

import { Ribbon } from "@/components/art/ribbon";
import { cta } from "@/lib/config/site";

import { Stage } from "./hero-stage";

/*
 * Homepage hero (client-chosen mix): a dark full-bleed field with a centered
 * statement and a built-in scan box, then the animated scan window floating on
 * the dark, with the silk ribbon flowing behind it. Submitting the box goes to
 * /?scan=<site>#scan, where the real Instant Funnel Scan starts on its own.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-[#07090f] text-white">
      {/* ribbon flowing behind the stage */}
      <Ribbon
        preset="band"
        lines={90}
        opacity={1}
        colors={["#3d8bff", "#8f5cff", "#ff7ab6", "#2fe0d6"]}
        className="pointer-events-none absolute inset-x-0 top-[30rem] -z-10 h-[52rem] w-full max-md:top-[44rem]"
      />
      {/* soft light pool so the headline area stays calm */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(50%_70%_at_50%_0%,rgb(61_139_255/0.16),transparent_70%)]" aria-hidden="true" />

      <div className="pm-wrap pt-20 text-center sm:pt-24 lg:pt-28">
        {/* <p className="pm-rise font-mono text-[12.5px] tracking-[0.08em] text-white/55 uppercase">Performance marketing studio · US &amp; UK</p> */}

        <h1
          id="hero-title"
          className="pm-h1 pm-rise mx-auto mt-7 max-w-[15ch] text-[clamp(2.9rem,1rem+5.8vw,6.4rem)] leading-[0.97]"
          style={{ animationDelay: "0.08s" }}
        >
          Turn paid traffic into <span className="pm-serif text-[#8fbcff]">measurable</span> growth.
        </h1>

        <p className="pm-rise mx-auto mt-7 max-w-[38rem] text-[1.18rem] leading-relaxed text-white/70" style={{ animationDelay: "0.16s" }}>
          Meta Ads, Google Ads, landing pages, CRO and tracking, run as one system. So you know where every lead came from.
        </p>

        {/* built-in scan */}
        <form
          action="/"
          method="get"
          className="pm-rise mx-auto mt-10 flex max-w-xl flex-col gap-2.5 rounded-[26px] bg-white/[0.07] p-2 text-left ring-1 ring-white/15 backdrop-blur sm:flex-row sm:rounded-full"
          style={{ animationDelay: "0.24s" }}
        >
          <label htmlFor="hero-scan" className="sr-only">
            Your website address
          </label>
          <div className="relative flex-1">
            <Globe className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-white/50" aria-hidden="true" />
            <input
              id="hero-scan"
              name="scan"
              required
              maxLength={300}
              inputMode="url"
              autoComplete="url"
              placeholder="Enter your website to scan it free"
              className="h-13 w-full rounded-full bg-transparent pr-4 pl-11 text-[16px] text-white outline-none placeholder:text-white/45"
            />
          </div>
          <button type="submit" className="pm-btn h-13 bg-white px-7 text-[15px] text-fg hover:bg-white/90">
            Scan my site
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>
        <p className="pm-rise mt-3 text-[13px] text-white/45" style={{ animationDelay: "0.3s" }}>
          Real browser test · tracking, speed, mobile and forms · about 20 seconds
        </p>

        <div className="pm-rise mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "0.36s" }}>
          <Link href={cta.primary.href} className="pm-btn pm-btn-brand h-12 px-6">
            {cta.primary.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href={cta.secondary.href} className="pm-btn h-12 px-6 text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.25)] hover:bg-white/10">
            {cta.secondary.label}
          </Link>
        </div>
        <p className="pm-rise mt-4 text-[13px] text-white/45" style={{ animationDelay: "0.4s" }}>
          Free audit · Written reply within 2 business days · You own your accounts and data
        </p>
      </div>

      <div className="pm-wrap relative mt-16 pb-20 text-fg lg:mt-20 lg:pb-28">
        <Stage />
        <p className="mt-6 text-center text-[12.5px] text-white/40">Illustration of a scan on a sample page. Scan your own site above for real results.</p>
      </div>
    </section>
  );
}
