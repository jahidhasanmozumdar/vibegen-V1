import type { Metadata } from "next";

import { NotFoundBody } from "@/components/sections/not-found-body";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** 404 for notFound() inside marketing pages; the marketing layout supplies header and footer. */
export default function MarketingNotFound() {
  return (
    <section className="bg-white">
      <NotFoundBody />
    </section>
  );
}
