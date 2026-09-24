import Link from "next/link";

import { CookieSettingsLink } from "@/components/tracking/cookie-settings-link";
import { cta, footerNav, legalNav, siteConfig } from "@/lib/config/site";

import { Logo } from "./header";

export function Footer({ contactEmail }: { contactEmail?: string }) {
  const email = contactEmail || siteConfig.contactEmail;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hair bg-white">
      <div className="pm-wrap">
        <div className="grid gap-14 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-fg-2">
              Meta Ads, Google Ads, landing pages, CRO and tracking, run as one acquisition system for businesses in the US and UK.
            </p>
            <Link href={cta.primary.href} className="pm-btn pm-btn-dark mt-7 h-11 text-[14px]">
              {cta.primary.label}
            </Link>
            <p className="mt-6 text-[14px] text-fg-2">
              {email ? (
                <a href={`mailto:${email}`} className="pm-link">
                  {email}
                </a>
              ) : (
                <>
                  Questions?{" "}
                  <Link href="/contact" className="pm-link">
                    Send us a message
                  </Link>
                </>
              )}
            </p>
            {siteConfig.social.length > 0 && (
              <ul className="mt-4 flex gap-5 text-[14px]">
                {siteConfig.social.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-fg-2 hover:text-fg" rel="noopener noreferrer" target="_blank">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-8">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h2 className="text-[13px] font-medium text-fg">{group.title}</h2>
                <ul className="mt-4 space-y-2.5 text-[14px]">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-fg-2 transition-colors hover:text-fg">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-hair py-6 text-[13px] text-fg-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} VibeGen. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-fg">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <CookieSettingsLink className="hover:text-fg" />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
