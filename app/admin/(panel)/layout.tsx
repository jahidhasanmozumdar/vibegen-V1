import type { Metadata } from "next";

import "../admin.css";

import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { ToastProvider } from "@/components/ui/toast";
import { requireUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/config/env";
import { adminStore } from "@/lib/data";
import { roleLabels } from "@/lib/data/labels";
import { listNotifications } from "@/lib/services/admin/notifications";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — VibeGen Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireUser();
  const store = await adminStore();

  const [notifications, leads, audits, messages] = await Promise.all([
    listNotifications(),
    store.list("leads", { where: { status: "new" } }),
    store.list("audit_requests", { where: { status: "new" } }),
    store.list("contact_messages", { where: { status: "unread" } }),
  ]);
  const unread = notifications.filter((n) => !n.read_at).length;

  const counts = {
    "/admin/leads": leads.length,
    "/admin/audits": audits.length,
    "/admin/messages": messages.length,
  };

  return (
    <ToastProvider>
      <div className="vg-admin relative min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <Sidebar counts={counts} />
        <div className="relative min-w-0 lg:pl-60">
          <Topbar
            user={{ name: user.name, email: user.email, role: roleLabels[user.role] }}
            unread={unread}
            recent={notifications.slice(0, 6)}
            demo={publicEnv.demoMode}
            counts={counts}
          />
          <main id="main" className="mx-auto w-full max-w-[1400px] min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
