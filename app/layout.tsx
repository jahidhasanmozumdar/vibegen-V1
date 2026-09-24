import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import { siteConfig } from "@/lib/config/site";
import "./globals.css";

/*
 * Type system — "Premium Calm" (Ramp / Stripe / Mercury calibre, client-chosen):
 * Geist for display + UI, Geist Mono for small labels, Instrument Serif italic
 * for a single human accent word.
 */
const sans = Geist({ variable: "--font-body-face", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-mono-face", subsets: ["latin"], display: "swap" });
const serif = Instrument_Serif({ variable: "--font-serif-face", subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Performance Marketing & Conversion`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_US",
    url: siteConfig.url,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
