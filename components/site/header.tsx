import { ChevronDown, Menu } from "lucide-react";
import Link from "next/link";

import { Wordmark } from "@/components/brand/logo-mark";
import { cta, mainNav } from "@/lib/config/site";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center ${className}`} aria-label="VibeGen home">
      <Wordmark />
    </Link>
  );
}

/** White bar with hairline, CSS-only dropdowns and mobile menu. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-hair bg-white/92 backdrop-blur-md">
      <div className="pm-wrap flex h-16 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center">
            {mainNav.map((item) => (
              <li key={item.href} className="group relative">
                <Link href={item.href} className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[14.5px] whitespace-nowrap text-fg-2 transition-colors hover:text-fg">
                  {item.label}
                  {item.children ? <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" aria-hidden="true" /> : null}
                </Link>
                {item.children ? (
                  <div className="invisible absolute top-full left-0 pt-2 opacity-0 transition-all duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <ul className="w-[21rem] rounded-[16px] border border-hair bg-white p-2 shadow-[0_24px_48px_-16px_rgb(10_13_20/0.18)]">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="block rounded-[10px] px-3.5 py-2.5 transition-colors hover:bg-soft">
                            <span className="block text-[14px] font-medium">{c.label}</span>
                            {c.description ? <span className="mt-0.5 block text-[13px] text-fg-3">{c.description}</span> : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href={cta.secondary.href} className="hidden rounded-full px-4 py-2 text-[14.5px] whitespace-nowrap text-fg-2 hover:text-fg xl:inline">
            {cta.secondary.label}
          </Link>
          <Link href={cta.primary.href} className="pm-btn pm-btn-dark h-10 px-5 text-[14px]">
            {cta.primary.label}
          </Link>
        </div>

        <details className="group lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-hair px-3.5 py-1.5 text-[14px] font-medium [&::-webkit-details-marker]:hidden">
            <Menu className="size-4" aria-hidden="true" /> Menu
          </summary>
          <div className="absolute inset-x-0 top-full border-b border-hair bg-white px-5 pt-2 pb-6 shadow-xl">
            <nav aria-label="Mobile">
              <ul className="divide-y divide-hair">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block py-3.5 text-[17px] font-medium">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-4 grid gap-2.5">
              <Link href={cta.primary.href} className="pm-btn pm-btn-dark">
                {cta.primary.label}
              </Link>
              <Link href={cta.secondary.href} className="pm-btn pm-btn-light">
                {cta.secondary.label}
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
