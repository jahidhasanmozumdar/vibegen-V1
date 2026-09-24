"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Bell, ChevronRight, Menu, Search } from "lucide-react";

import { DemoBadge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { Dropdown } from "@/components/ui/dropdown";
import { Spinner } from "@/components/ui/spinner";
import { logoutAction } from "@/lib/actions/auth";
import type { ApiResponse, Notification } from "@/lib/data/types";
import type { SearchResult } from "@/lib/services/admin/search";
import { cn } from "@/lib/utils/cn";
import { formatRelative, initials } from "@/lib/utils/format";
import { segmentLabels } from "./nav";
import { AdminLogo, SidebarNav } from "./sidebar";

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    href: `/${segments.slice(0, i + 1).join("/")}`,
    label: segmentLabels[seg] ?? "Details",
  }));
  if (crumbs.length === 1) crumbs.push({ href: "/admin", label: "Overview" });

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 md:block">
      <ol className="flex items-center gap-1.5 text-[13px] text-fg-3">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${c.href}-${i}`} className="flex min-w-0 items-center gap-1">
              {last ? (
                <span aria-current="page" className="truncate font-medium text-fg">
                  {c.label}
                </span>
              ) : (
                <>
                  <Link href={c.href} className="truncate rounded-sm transition-colors hover:text-fg">
                    {c.label}
                  </Link>
                  <ChevronRight className="size-3.5 shrink-0 text-[#c3c6ce]" strokeWidth={2} aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const typeLabels: Record<SearchResult["type"], string> = {
  lead: "Lead",
  audit: "Audit",
  message: "Message",
  case_study: "Case study",
  blog: "Blog",
};

function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Debounced lookup against the admin search endpoint.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        const body = (await res.json()) as ApiResponse<SearchResult[]>;
        setResults(body.success ? body.data : []);
        setActiveIndex(-1);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => !wrapRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        wrapRef.current?.querySelector("input")?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const visible = q.trim().length >= 2 ? (results ?? []) : [];
  const showPanel = open && q.trim().length >= 2;

  function go(href: string) {
    setOpen(false);
    setQ("");
    setResults(null);
    router.push(href);
  }

  return (
    <div ref={wrapRef} className="relative w-full max-w-[26rem]">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (activeIndex >= 0 && visible[activeIndex]) go(visible[activeIndex].href);
          else if (q.trim()) go(`/admin/search?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <label htmlFor="admin-search" className="sr-only">
          Search leads, audits, messages and content
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-3" strokeWidth={1.8} aria-hidden="true" />
        <input
          id="admin-search"
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, -1));
            } else if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search leads, audits, content…"
          className="h-9 w-full rounded-full border border-hair bg-white pr-14 pl-9 text-[13.5px] text-fg transition-[border-color,box-shadow] placeholder:text-fg-3 hover:border-[#d9dbe1] focus:border-brand focus:shadow-[0_0_0_3px_rgb(10_108_255/0.14)] focus:outline-none"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 items-center gap-0.5 rounded-[6px] border border-hair bg-soft px-1.5 py-0.5 text-[11px] font-medium text-fg-3 sm:inline-flex">
          <span aria-hidden="true">⌘</span>K<span className="sr-only"> (Control or Command K)</span>
        </kbd>
      </form>

      {showPanel && (
        <div className="absolute top-full z-50 animate-fade overflow-hidden rounded-[14px] border border-hair bg-white shadow-[0_20px_48px_-20px_rgb(10_13_20/0.28)] right-0 left-0 mt-2">
          {loading && visible.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-fg-2">
              <Spinner /> Searching…
            </div>
          ) : visible.length === 0 ? (
            <div className="px-4 py-4 text-sm text-fg-2">
              No matches for “{q.trim()}”. Try a name, company, email or website.
            </div>
          ) : (
            <ul id={listId} role="listbox" aria-label="Search results" className="max-h-80 overflow-y-auto py-1">
              {visible.map((r, i) => (
                <li
                  key={`${r.type}-${r.id}`}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(r.href)}
                  className={cn("mx-1.5 flex cursor-pointer items-center gap-3 rounded-[8px] px-3 py-2", i === activeIndex ? "bg-soft" : "hover:bg-[#fafaf9]")}
                >
                  <span className="w-[4.75rem] shrink-0">
                    <span className="inline-flex h-5 items-center rounded-full bg-[#f1f2f4] px-2 text-[11px] font-medium text-fg-2">{typeLabels[r.type]}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-fg">{r.title}</span>
                    <span className="block truncate text-xs text-fg-2">{r.subtitle}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href={`/admin/search?q=${encodeURIComponent(q.trim())}`} onClick={() => setOpen(false)} className="block border-t border-hair px-4 py-2.5 text-[13px] hover:bg-[#fafaf9]">
            <span className="font-medium text-brand underline-offset-4 hover:underline">See all results</span>
          </Link>
        </div>
      )}
    </div>
  );
}

function NotificationBell({ unread, recent }: { unread: number; recent: Notification[] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !wrapRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative inline-flex size-9 items-center justify-center rounded-full border border-hair bg-white text-fg-2 transition-colors hover:text-fg aria-expanded:text-fg"
      >
        <Bell className="size-[17px]" strokeWidth={1.8} />
        {unread > 0 && (
          <span className="tabular absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10.5px] font-semibold text-white ring-2 ring-soft" aria-hidden="true">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div id={panelId} className="absolute top-full z-50 animate-fade overflow-hidden rounded-[14px] border border-hair bg-white shadow-[0_20px_48px_-20px_rgb(10_13_20/0.28)] right-0 mt-2 w-[min(22rem,calc(100vw-2rem))]">
          <div className="flex items-center justify-between border-b border-hair px-4 py-3">
            <p className="text-[14px] font-semibold tracking-[-0.01em] text-fg">Notifications</p>
            {unread > 0 && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11.5px] font-medium text-brand">{unread} unread</span>}
          </div>
          {recent.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-fg-2">You&apos;re all caught up.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-hair overflow-y-auto">
              {recent.map((n) => (
                <li key={n.id}>
                  <Link href={n.link ?? "/admin/notifications"} onClick={() => setOpen(false)} className="flex gap-3 px-4 py-3 hover:bg-[#fafaf9]">
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read_at ? "bg-[#e0e0e5]" : "bg-brand")} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-fg">
                        {n.title}
                        {!n.read_at && <span className="sr-only"> (unread)</span>}
                      </span>
                      <span className="block truncate text-[13px] text-fg-2">{n.body}</span>
                      <span className="mt-0.5 block text-xs text-fg-3">{formatRelative(n.created_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/notifications" onClick={() => setOpen(false)} className="block border-t border-hair px-4 py-2.5 text-center text-[13px] hover:bg-[#fafaf9]">
            <span className="font-medium text-brand underline-offset-4 hover:underline">View all notifications</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export interface TopbarProps {
  user: { name: string; email: string; role: string };
  unread: number;
  recent: Notification[];
  demo: boolean;
  counts?: Partial<Record<string, number>>;
}

export function Topbar({ user, unread, recent, demo, counts }: TopbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-hair bg-soft/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-hair bg-white text-fg-2 hover:text-fg lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-[18px]" strokeWidth={1.8} />
        </button>
        <Breadcrumb />
        {demo && <DemoBadge label="Demo environment" className="hidden sm:inline-flex" />}
        <div className="ml-auto flex flex-1 items-center justify-end gap-2">
          <GlobalSearch />
          <NotificationBell unread={unread} recent={recent} />
          <Dropdown
            label="Account menu"
            trigger={
              <span
                className="flex size-9 items-center justify-center rounded-full bg-[#f1ebff] text-[12.5px] font-semibold text-[#5b21d6] ring-1 ring-[#e4d9ff]"
                title={user.email}
              >
                {initials(user.name) || "A"}
              </span>
            }
            items={[
              { label: `${user.name} · ${user.role}`, onSelect: () => router.push("/admin/settings?tab=profile") },
              { label: "Settings", onSelect: () => router.push("/admin/settings") },
              { label: "View website", onSelect: () => window.open("/", "_blank", "noopener") },
              { label: "Log out", danger: true, onSelect: () => void logoutAction() },
            ]}
          />
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="VibeGen admin" header={<AdminLogo />}>
        <SidebarNav counts={counts} onNavigate={() => setDrawerOpen(false)} />
      </Drawer>
    </header>
  );
}
