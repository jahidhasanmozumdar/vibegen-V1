"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils/cn";
import { LogoMark } from "@/components/brand/logo-mark";
import { adminNav } from "./nav";

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Logo mark + wordmark + quiet "Admin" tag. */
export function AdminLogo({ className, href = "/admin" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label={href === "/admin" ? "VibeGen admin — dashboard" : "VibeGen — home"}
      className={cn("inline-flex items-center gap-2 rounded-[8px] text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand", className)}
    >
      <LogoMark className="h-[22px]" />
      <span className="text-[16px] font-semibold tracking-[-0.03em] whitespace-nowrap">VibeGen</span>
      <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] leading-none font-medium text-fg-2 ring-1 ring-hair">Admin</span>
    </Link>
  );
}

const itemCls =
  "group relative flex h-9 items-center gap-2.5 rounded-[9px] px-2.5 text-[13.5px] transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand";

/** Admin navigation (desktop rail and mobile drawer). */
export function SidebarNav({ counts, onNavigate }: { counts?: Partial<Record<string, number>>; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="relative flex h-full flex-col">
      <div className="vg-scroll-thin flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {adminNav.map((group) => (
          <div key={group.title}>
            <p className="px-2.5 pb-1.5 text-[11.5px] font-medium text-fg-3">{group.title}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const count = counts?.[item.href];
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(itemCls, active ? "bg-soft font-medium text-fg" : "text-fg-2 hover:bg-[#fafaf9] hover:text-fg")}
                    >
                      <item.icon className={cn("size-4 shrink-0", active ? "text-fg" : "text-fg-3 group-hover:text-fg-2")} strokeWidth={1.8} aria-hidden="true" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {count ? (
                        <span
                          className={cn(
                            "tabular inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium",
                            active ? "bg-white text-fg ring-1 ring-hair" : "bg-brand-soft text-brand",
                          )}
                          aria-label={`${count} new`}
                        >
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="space-y-0.5 border-t border-hair p-3">
        <a href="/" target="_blank" rel="noopener" className={cn(itemCls, "w-full text-fg-2 hover:bg-[#fafaf9] hover:text-fg")}>
          <ExternalLink className="size-4 text-fg-3" strokeWidth={1.8} aria-hidden="true" />
          View website<span className="sr-only"> (opens in a new tab)</span>
        </a>
        <form action={logoutAction}>
          <button type="submit" className={cn(itemCls, "w-full text-fg-2 hover:bg-[#fafaf9] hover:text-fg")}>
            <LogOut className="size-4 text-fg-3" strokeWidth={1.8} aria-hidden="true" />
            Log out
          </button>
        </form>
      </div>
    </nav>
  );
}

export function Sidebar({ counts }: { counts?: Partial<Record<string, number>> }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-hair bg-white lg:flex">
      <div className="flex h-16 shrink-0 items-center px-5">
        <AdminLogo />
      </div>
      <SidebarNav counts={counts} />
    </aside>
  );
}
