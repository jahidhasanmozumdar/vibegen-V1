import type { Metadata } from "next";

import { NotFoundBody } from "@/components/sections/not-found-body";
import { Logo } from "@/components/site/header";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** Root 404 for unmatched URLs. Renders outside the marketing layout, so it carries its own minimal header. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-fg">
      <header className="border-b border-hair">
        <div className="pm-wrap flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main id="main" className="flex-1">
        <NotFoundBody />
      </main>
    </div>
  );
}
