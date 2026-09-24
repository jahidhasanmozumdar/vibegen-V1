import type { Metadata } from "next";
import Link from "next/link";

import "../admin.css";

import { Wordmark } from "@/components/brand/logo-mark";
import { Ribbon } from "@/components/art/ribbon";

export const metadata: Metadata = {
  title: { default: "Sign in", template: "%s — VibeGen Admin" },
  robots: { index: false, follow: false },
};

/** Centered sign-in card on the soft canvas, with a faint silk ribbon behind it. */
export default function AdminAuthLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="vg-admin relative isolate flex min-h-dvh flex-col overflow-hidden">
      <Ribbon preset="band" lines={48} opacity={0.35} className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[62%] w-full" />

      <main id="main" className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
        <Link
          href="/"
          aria-label="VibeGen — home"
          className="mb-8 inline-flex items-center gap-2 rounded-[8px] text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <Wordmark size={19} />
        </Link>

        <div className="w-full max-w-[26rem] rounded-[20px] border border-hair bg-white px-6 py-8 shadow-[0_1px_2px_rgb(10_13_20/0.04),0_32px_64px_-32px_rgb(10_13_20/0.22)] sm:px-9 sm:py-10">
          {children}
        </div>

        <p className="mt-6 text-[13px] text-fg-2">
          <Link href="/" className="transition-colors hover:text-fg">
            ← Back to vibegen.studio
          </Link>
        </p>
      </main>
    </div>
  );
}
