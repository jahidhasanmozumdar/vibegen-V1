import { AuditOffer } from "@/components/home/audit-offer";
import { Faq } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { Industries } from "@/components/home/industries";
import { Pricing } from "@/components/home/pricing";
import { Principles } from "@/components/home/principles";
import { Problems } from "@/components/home/problems";
import { Reporting } from "@/components/home/reporting";
import { ScanStrip } from "@/components/home/scan-strip";
import { Scope } from "@/components/home/scope";
import { Services } from "@/components/home/services";
import { Steps } from "@/components/home/steps";
import { JsonLd, faqSchema } from "@/components/seo/json-ld";
import { homeFaqs } from "@/lib/content/faqs";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export const metadata = pageMetadata({
  title: "VibeGen — Performance Marketing & Conversion",
  absoluteTitle: true,
  description:
    "Meta Ads, Google Ads, landing pages, CRO and analytics run as one acquisition system for startups and growing businesses in the US and UK. Start with a free growth audit.",
  path: "/",
});

/*
 * Homepage — "Premium Calm", argued like an essay:
 * dark hero with built-in scan box + animated scan stage → live scan → diagnosis (symptom → cause → fix) →
 * principles → the solution in five parts → how it works → the result
 * (reporting) → who it's for → the offer → who does what → price → FAQ → CTA.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ScanStrip />
      <Problems />
      <Principles />
      <Services />
      <Steps />
      <Reporting />
      <Industries />
      <AuditOffer />
      <Scope />
      <Pricing />
      <Faq />
      <FinalCta />
      <JsonLd data={faqSchema(homeFaqs)} />
    </>
  );
}
