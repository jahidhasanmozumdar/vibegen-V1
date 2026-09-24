import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { DataActions, GeneralForm, IntegrationsForm, NotificationsForm, ProfileForm, SiteForm } from "@/components/admin/settings/settings-forms";
import { KeyValue, Panel, StatusRow } from "@/components/admin/settings/status-panels";
import { Alert } from "@/components/ui/alert";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { SESSION_TTL_SECONDS } from "@/lib/auth/token";
import { authDriver, can, requireUser, type Permission, type SessionUser } from "@/lib/auth/session";
import { roleLabels } from "@/lib/data/labels";
import { ROLES, type SiteSettings } from "@/lib/data/types";
import type { TrackEvent } from "@/lib/tracking/events";
import { demoCounts, type DemoTable } from "@/lib/services/admin/demo";
import { activeEnvOverrides, getProfile, getSavedSettings, integrationStatus } from "@/lib/services/admin/settings";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Settings" };

const TABS = [
  { id: "general", label: "General" },
  { id: "profile", label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "integrations", label: "Integrations" },
  { id: "tracking", label: "Tracking" },
  { id: "email", label: "Email" },
  { id: "security", label: "Security" },
  { id: "site", label: "Site Settings" },
  { id: "data", label: "Data" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const EVENTS: { name: TrackEvent; description: string; conversion?: boolean }[] = [
  { name: "growth_audit_submit", description: "Free Growth Audit form submitted", conversion: true },
  { name: "contact_submit", description: "Contact form submitted", conversion: true },
  { name: "booking_request_submit", description: "Strategy call request submitted", conversion: true },
  { name: "external_booking_click", description: "Clicked through to the external booking page" },
  { name: "book_call_click", description: "Clicked a “Book a Strategy Call” CTA" },
  { name: "form_start", description: "First interaction with any lead form" },
  { name: "form_error", description: "A lead form failed validation" },
  { name: "service_view", description: "Viewed a service page" },
  { name: "pricing_view", description: "Viewed the pricing page" },
  { name: "case_study_view", description: "Viewed a case study" },
  { name: "page_view", description: "Page view (sent after analytics consent)" },
];

const PERMISSION_LABELS: Record<Permission, string> = {
  "content:write": "Edit and publish content (blog, case studies, services, pricing…)",
  "leads:delete": "Delete leads and CRM records",
  "settings:write": "Change workspace settings",
  "demo:manage": "Load / remove demo data",
};

const DEMO_TABLE_LABELS: Record<DemoTable, string> = {
  leads: "Leads",
  audit_requests: "Audit requests",
  contact_messages: "Contact messages",
  bookings: "Bookings",
  case_studies: "Case studies",
  testimonials: "Testimonials",
  blog_posts: "Blog posts",
  utm_sessions: "UTM sessions",
  analytics_events: "Analytics events",
  notifications: "Notifications",
};

function isTab(value: unknown): value is TabId {
  return typeof value === "string" && TABS.some((t) => t.id === value);
}

export default async function SettingsPage(props: PageProps<"/admin/settings">) {
  const user = await requireUser();
  const { tab: rawTab } = await props.searchParams;
  const tab: TabId = isTab(rawTab) ? rawTab : "general";
  const canEdit = can(user, "settings:write");
  const status = integrationStatus();
  const overrides = activeEnvOverrides();

  return (
    <>
      <PageHeader title="Settings" description="Workspace configuration. Secrets live in environment variables and are never shown here." demo={status.demoMode} />

      <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <ul className="flex gap-0.5 pb-1 lg:flex-col">
            {TABS.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/admin/settings?tab=${t.id}`}
                  aria-current={tab === t.id ? "page" : undefined}
                  scroll={false}
                  className={cn(
                    "block rounded-[9px] px-3 py-2 text-[13.5px] whitespace-nowrap transition-colors",
                    tab === t.id ? "bg-white font-medium text-fg shadow-[0_0_0_1px_#e8e8ec]" : "text-fg-2 hover:bg-white/60 hover:text-fg",
                  )}
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">
          {!canEdit && ["general", "notifications", "integrations", "site", "data"].includes(tab) && (
            <Alert tone="info">You can view these settings. Only admins can change them.</Alert>
          )}
          <TabContent tab={tab} user={user} canEdit={canEdit} status={status} overrides={overrides} />
        </div>
      </div>
    </>
  );
}

async function TabContent({
  tab,
  user,
  canEdit,
  status,
  overrides,
}: {
  tab: TabId;
  user: SessionUser;
  canEdit: boolean;
  status: ReturnType<typeof integrationStatus>;
  overrides: ReturnType<typeof activeEnvOverrides>;
}) {
  switch (tab) {
    case "general": {
      const { settings } = await getSavedSettings();
      return <GeneralForm settings={settings} canEdit={canEdit} overrides={overrides} />;
    }
    case "profile": {
      const profile = authDriver === "database" ? await getProfile(user.id) : null;
      return (
        <>
          <ProfileForm name={profile?.full_name || user.name} email={user.email} role={roleLabels[user.role]} editable={authDriver === "database"} />
          <Panel title="Password">
            <div className="py-3 text-sm text-fg-2">
              {authDriver === "database" ? (
                <>
                  To change your password,{" "}
                  <Link href="/admin/forgot-password" className="font-medium text-brand underline-offset-4 hover:underline">
                    request a reset link
                  </Link>
                  . It&apos;s emailed to {user.email}.
                </>
              ) : (
                <>
                  Demo mode uses the <code className="font-mono text-fg">DEMO_ADMIN_PASSWORD</code> environment variable. Set <code className="font-mono text-fg">DATABASE_URL</code> for real accounts and password
                  resets.
                </>
              )}
            </div>
          </Panel>
        </>
      );
    }
    case "notifications": {
      const { settings } = await getSavedSettings();
      return <NotificationsForm settings={settings} canEdit={canEdit} emailReady={status.resendConfigured && status.adminNotificationConfigured} />;
    }
    case "integrations": {
      const { settings } = await getSavedSettings();
      return (
        <>
          <IntegrationsForm settings={settings} canEdit={canEdit} overrides={overrides} />
          <Panel title="Connections" description="Server-side configuration from environment variables.">
            <StatusRow
              label="Database"
              ok={status.dataDriver === "postgres"}
              okText={`PostgreSQL${status.databaseHost ? ` · ${status.databaseHost}` : ""}`}
              offText="Local demo store"
              detail={status.dataDriver === "postgres" ? "DATABASE_URL is set (Prisma + pg adapter)." : "Set DATABASE_URL to use a real PostgreSQL database."}
            />
            <StatusRow label="Direct database URL" ok={status.directUrlConfigured} detail="DIRECT_URL is used for migrations (a non-pooled connection)." />
            <StatusRow
              label="Booking webhook"
              ok={status.bookingWebhookConfigured}
              detail={
                <>
                  POST <code className="font-mono">{status.siteUrl}/api/bookings/webhook</code> — signed with <code className="font-mono">BOOKING_WEBHOOK_SECRET</code>.
                </>
              }
            />
            <StatusRow label="Email provider" ok={status.resendConfigured} okText="Resend configured" offText="Console (not sending)" />
          </Panel>
        </>
      );
    }
    case "tracking":
      return <TrackingPanel overrides={overrides} status={status} />;
    case "email":
      return (
        <Panel title="Email" description="Credentials are read from server environment variables and never displayed.">
          <StatusRow
            label="Provider"
            ok={status.resendConfigured}
            okText="Resend configured"
            offText="Console (not sending)"
            detail={status.resendConfigured ? "Emails are delivered through Resend." : "Set EMAIL_PROVIDER=resend and RESEND_API_KEY to send real emails. Until then emails are only logged on the server."}
          />
          <StatusRow label="Admin notification address" ok={status.adminNotificationConfigured} detail="ADMIN_NOTIFICATION_EMAIL — where new lead / audit / booking alerts go." />
          <StatusRow label="From address" ok detail={<code className="font-mono">{status.emailFrom}</code>} okText="Set" />
          <StatusRow
            label="Lead confirmation emails"
            ok={!status.demoMode}
            okText="Enabled"
            offText="Paused in demo mode"
            detail="Confirmation emails are never sent while NEXT_PUBLIC_DEMO_MODE is on."
          />
        </Panel>
      );
    case "security":
      return <SecurityPanel user={user} status={status} />;
    case "site": {
      const { settings } = await getSavedSettings();
      return <SiteForm settings={settings} canEdit={canEdit} overrides={overrides} />;
    }
    case "data":
      return <DataPanel canManage={can(user, "demo:manage")} status={status} />;
  }
}

function effective(key: "ga4_id" | "gtm_id" | "meta_pixel_id" | "google_ads_id", saved: SiteSettings, overrides: ReturnType<typeof activeEnvOverrides>) {
  return overrides[key]?.value || saved[key];
}

async function TrackingPanel({ overrides, status }: { overrides: ReturnType<typeof activeEnvOverrides>; status: ReturnType<typeof integrationStatus> }) {
  const { settings } = await getSavedSettings();
  const tags = [
    { label: "Google Tag Manager", key: "gtm_id" as const },
    { label: "Google Analytics 4", key: "ga4_id" as const },
    { label: "Meta Pixel", key: "meta_pixel_id" as const },
    { label: "Google Ads conversions", key: "google_ads_id" as const },
  ];
  return (
    <>
      <Panel title="Consent mode" description="How tags behave before and after a visitor chooses.">
        <div className="space-y-3 py-3 text-sm leading-relaxed text-fg-2">
          <p>
            Google Consent Mode v2 starts with <strong>analytics and ads storage denied</strong>. No analytics or advertising cookies are set until the visitor accepts in the cookie
            banner.
          </p>
          <p>
            Accepting <em>analytics</em> enables GA4. Accepting <em>marketing</em> enables the Meta Pixel and Google Ads conversion tracking. Visitors can change their choice at any
            time from “Cookie settings” in the footer.
          </p>
          {status.demoMode && <p className="text-fg-2">Demo mode is on, so no events are sent to third-party analytics.</p>}
        </div>
      </Panel>

      <Panel title="Tags" description="Effective value = environment variable if set, otherwise the ID saved under Integrations.">
        {tags.map((t) => {
          const value = effective(t.key, settings, overrides);
          return (
            <StatusRow
              key={t.key}
              label={t.label}
              ok={Boolean(value)}
              okText="Active"
              offText="Not set"
              detail={value ? <code className="font-mono">{value}</code> : "Add the ID under Integrations to enable it."}
            />
          );
        })}
      </Panel>

      <Panel title="Conversion events" description="The only events the site sends (lib/tracking/events.ts).">
        <ul className="divide-y divide-hair">
          {EVENTS.map((e) => (
            <li key={e.name} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <code className="font-mono text-[13px] text-fg">{e.name}</code>
                <p className="text-[13px] text-fg-2">{e.description}</p>
              </div>
              {e.conversion && <Badge tone="accent">Conversion</Badge>}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

function SecurityPanel({ user, status }: { user: SessionUser; status: ReturnType<typeof integrationStatus> }) {
  const permissions = Object.keys(PERMISSION_LABELS) as Permission[];
  const hours = Math.round(SESSION_TTL_SECONDS / 3600);
  return (
    <>
      {authDriver === "local" && status.isProduction && (
        <Alert tone="danger" title="Demo credentials in use">
          This production deployment signs in with the local demo driver. Set DATABASE_URL to use real admin accounts before sharing the admin, and set a strong SESSION_SECRET.
        </Alert>
      )}
      {authDriver === "local" && !status.isProduction && status.demoPasswordIsDefault && (
        <Alert tone="warning" title="Default demo password">
          DEMO_ADMIN_PASSWORD isn&apos;t set, so the documented default password works. Fine for local development only.
        </Alert>
      )}
      <Panel title="Authentication">
        <KeyValue
          items={[
            ["Auth driver", authDriver === "database" ? "Database accounts (email + scrypt-hashed password)" : "Local demo session (signed cookie)"],
            ["Session length", `${hours} hours, then sign in again`],
            ["Session secret", status.sessionSecretConfigured ? "Custom SESSION_SECRET set" : "Using the development key — set SESSION_SECRET"],
            ["Signed in as", `${user.email} · ${roleLabels[user.role]}`],
          ]}
        />
      </Panel>

      <Panel title="Roles & permissions" description="Everyone with an active profile can view the pipeline. Every admin page and action checks these permissions on the server.">
        <div className="-mx-5">
          <Table>
            <THead>
              <tr>
                <TH>Permission</TH>
                {ROLES.map((r) => (
                  <TH key={r} className="text-center">
                    {roleLabels[r]}
                  </TH>
                ))}
              </tr>
            </THead>
            <tbody>
              <TR>
                <TD>View and work leads, audits, messages, bookings</TD>
                {ROLES.map((r) => (
                  <TD key={r} className="text-center">
                    <Allowed yes />
                  </TD>
                ))}
              </TR>
              {permissions.map((p) => (
                <TR key={p}>
                  <TD>{PERMISSION_LABELS[p]}</TD>
                  {ROLES.map((r) => (
                    <TD key={r} className="text-center">
                      <Allowed yes={can({ ...user, role: r }, p)} />
                    </TD>
                  ))}
                </TR>
              ))}
            </tbody>
          </Table>
        </div>
        <p className="py-3 text-[13px] text-fg-2">
          Add team members with <code className="font-mono">pnpm admin:create email@company.com &quot;Full Name&quot; role</code>. Deactivate someone by setting{" "}
          <code className="font-mono">active = false</code> on their row in the <code className="font-mono">profiles</code> table; it takes effect on their next request.
        </p>
      </Panel>
    </>
  );
}

function Allowed({ yes }: { yes: boolean }) {
  return yes ? (
    <span className="text-success">
      <span aria-hidden="true">✓</span>
      <span className="sr-only">Allowed</span>
    </span>
  ) : (
    <span className="text-fg-3">
      <span aria-hidden="true">—</span>
      <span className="sr-only">Not allowed</span>
    </span>
  );
}

async function DataPanel({ canManage, status }: { canManage: boolean; status: ReturnType<typeof integrationStatus> }) {
  const counts = await demoCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <>
      <Panel
        title="Demo data"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Sample records flagged <code className="font-mono">is_demo</code>, shown with a <DemoBadge className="h-5" /> badge.
          </span>
        }
      >
        <div className="grid grid-cols-2 gap-x-6 py-2 sm:grid-cols-3">
          {(Object.keys(DEMO_TABLE_LABELS) as DemoTable[]).map((t) => (
            <div key={t} className="flex items-baseline justify-between gap-2 border-b border-hair py-2">
              <span className="text-[13px] text-fg-2">{DEMO_TABLE_LABELS[t]}</span>
              <span className="tabular text-sm font-medium text-fg">{counts[t].toLocaleString("en-US")}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3 py-4">
          <p className="text-sm text-fg-2">
            {total > 0
              ? `${total.toLocaleString("en-US")} demo records in the database. Remove them before launch so reports only show real activity.`
              : "No demo records. Load them to explore the dashboard with realistic sample data."}
          </p>
          <DataActions hasDemo={total > 0} canManage={canManage} />
          <p className="text-[13px] text-fg-2">
            “Install starter content” adds the default services, industries, pricing, blog posts and settings to empty tables only. It never overwrites your edits.
          </p>
        </div>
      </Panel>

      <Panel title="Data driver">
        <StatusRow
          label={status.dataDriver === "postgres" ? "PostgreSQL (Prisma)" : "Local JSON store"}
          ok={status.dataDriver === "postgres"}
          okText="Production-ready"
          offText="Development only"
          detail={
            status.dataDriver === "postgres"
              ? "Data is stored in PostgreSQL. Apply schema changes with `pnpm db:deploy` (prisma migrate deploy)."
              : "Records are saved to .data/vibegen-db.json. Serverless hosts wipe this file — set DATABASE_URL before deploying."
          }
        />
      </Panel>
    </>
  );
}
