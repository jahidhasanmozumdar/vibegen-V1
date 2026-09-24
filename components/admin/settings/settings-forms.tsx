"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Database, Download, Trash2 } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, fieldAria } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { installStarterContentAction, loadDemoDataAction, removeDemoDataAction } from "@/lib/actions/admin/demo";
import { saveSettingsAction, updateProfileAction } from "@/lib/actions/admin/settings";
import { bookingProviderLabels, toOptions } from "@/lib/data/labels";
import type { ActionState, SiteSettings } from "@/lib/data/types";

type Errors = Record<string, string[] | undefined>;
type Overrides = Partial<Record<keyof SiteSettings, { env: string; value: string }>>;
const idle: ActionState = { status: "idle" };

/** Toast once per new action result. */
function useResultToast(state: ActionState) {
  const { toast } = useToast();
  const handled = useRef(state);
  useEffect(() => {
    if (handled.current === state || state.status === "idle") return;
    handled.current = state;
    if (state.status === "success") toast(state.message ?? "Saved.");
    else if (state.message) toast(state.message, "error");
  }, [state, toast]);
}

/**
 * Card-style settings form. Submits via startTransition (no automatic form
 * reset, so values survive validation errors) and shows a footer save bar.
 */
function SectionForm({
  title,
  description,
  section,
  canEdit,
  action = saveSettingsAction,
  children,
  footerNote,
}: {
  title: string;
  description?: ReactNode;
  section?: string;
  canEdit: boolean;
  action?: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: (errors: Errors) => ReactNode;
  footerNote?: ReactNode;
}) {
  const [state, dispatch, pending] = useActionState(action, idle);
  const [, start] = useTransition();
  const [dirty, setDirty] = useState(false);
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.status === "success") setDirty(false);
  }
  useResultToast(state);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    start(() => dispatch(data));
  }

  return (
    <form onSubmit={onSubmit} onChange={() => setDirty(true)} noValidate className="rounded-[16px] border border-hair bg-white">
      <header className="border-b border-hair px-5 py-4">
        <h2 className="text-[17px] leading-tight font-semibold tracking-[-0.025em]">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-fg-2">{description}</p>}
      </header>
      {section && <input type="hidden" name="section" value={section} />}
      <fieldset disabled={!canEdit || pending} className="space-y-5 px-5 py-5">
        {state.status === "error" && state.message && <Alert tone="danger">{state.message}</Alert>}
        {children(state.fieldErrors ?? {})}
      </fieldset>
      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-b-[16px] border-t border-hair bg-[#fafaf9] px-5 py-3">
        <p className="text-[13px] text-fg-2">{!canEdit ? "Only admins can change these settings." : dirty ? "Unsaved changes" : footerNote}</p>
        {canEdit && (
          <Button type="submit" size="sm" loading={pending} loadingText="Saving…">
            Save Changes
          </Button>
        )}
      </footer>
    </form>
  );
}

function OverrideNote({ override }: { override?: { env: string; value: string } }) {
  if (!override) return null;
  return (
    <p className="mt-1.5 rounded-[10px] bg-brand-soft px-2.5 py-1.5 text-[12.5px] text-fg-2">
      Environment wins: <code className="font-mono">{override.env}</code> is set to <code className="font-mono">{override.value}</code>, so the site uses that value instead of
      the one saved here.
    </p>
  );
}

/* ------------------------------------------------------------------ */

export function GeneralForm({ settings, canEdit, overrides }: { settings: SiteSettings; canEdit: boolean; overrides: Overrides }) {
  return (
    <SectionForm title="General" description="How the business appears across the site and emails." section="general" canEdit={canEdit}>
      {(errors) => (
        <>
          <Field id="company_name" label="Company name" required error={errors.company_name}>
            <Input {...fieldAria("company_name", errors.company_name)} name="company_name" defaultValue={settings.company_name} maxLength={120} />
          </Field>
          <Field id="contact_email" label="Contact email" hint="Shown on the contact page and footer. Leave empty to hide it." error={errors.contact_email}>
            <Input {...fieldAria("contact_email", errors.contact_email, true)} name="contact_email" type="email" defaultValue={settings.contact_email} />
          </Field>
          <OverrideNote override={overrides.contact_email} />
        </>
      )}
    </SectionForm>
  );
}

export function NotificationsForm({ settings, canEdit, emailReady }: { settings: SiteSettings; canEdit: boolean; emailReady: boolean }) {
  const toggles: { name: keyof SiteSettings; label: string; description: string }[] = [
    { name: "notify_new_lead", label: "New lead", description: "Email the team when a new lead is created." },
    { name: "notify_new_audit", label: "New audit request", description: "Email the team when someone requests a Free Growth Audit." },
    { name: "notify_new_message", label: "New contact message", description: "Email the team when the contact form is submitted." },
    { name: "notify_new_booking", label: "New booking", description: "Email the team when a strategy call is booked or requested." },
    { name: "send_lead_confirmation", label: "Confirmation email to the lead", description: "Send the person a short “we got your request” email. Never sent in demo mode." },
  ];
  return (
    <SectionForm
      title="Notifications"
      description="In-app notifications are always on. These control emails."
      section="notifications"
      canEdit={canEdit}
    >
      {() => (
        <>
          {!emailReady && (
            <Alert tone="warning" title="Emails aren't being sent yet">
              The email provider isn&apos;t configured, so these settings are saved but nothing is delivered. See the{" "}
              <Link href="/admin/settings?tab=email" className="font-medium underline">
                Email tab
              </Link>
              .
            </Alert>
          )}
          <div className="space-y-4">
            {toggles.map((t) => (
              <Checkbox key={t.name} name={t.name} defaultChecked={Boolean(settings[t.name])} label={t.label} description={t.description} />
            ))}
          </div>
        </>
      )}
    </SectionForm>
  );
}

export function IntegrationsForm({ settings, canEdit, overrides }: { settings: SiteSettings; canEdit: boolean; overrides: Overrides }) {
  const ids: { name: "ga4_id" | "gtm_id" | "meta_pixel_id" | "google_ads_id"; label: string; placeholder: string; hint: string }[] = [
    { name: "ga4_id", label: "GA4 Measurement ID", placeholder: "G-XXXXXXXXXX", hint: "GA4 → Admin → Data streams → your web stream." },
    { name: "gtm_id", label: "GTM Container ID", placeholder: "GTM-XXXXXXX", hint: "If set, tags can be managed in GTM instead of loading GA4 directly." },
    { name: "meta_pixel_id", label: "Meta Pixel ID", placeholder: "123456789012345", hint: "Events Manager → Data sources → your Pixel." },
    { name: "google_ads_id", label: "Google Ads Conversion ID", placeholder: "AW-123456789", hint: "Google Ads → Goals → Conversions → Tag setup." },
  ];
  return (
    <SectionForm
      title="Integrations"
      description="Public IDs only. Secrets (API keys, webhook secrets) belong in server environment variables, never here."
      section="integrations"
      canEdit={canEdit}
    >
      {(errors) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            {ids.map((f) => (
              <div key={f.name}>
                <Field id={f.name} label={f.label} hint={f.hint} error={errors[f.name]}>
                  <Input
                    {...fieldAria(f.name, errors[f.name], true)}
                    name={f.name}
                    defaultValue={settings[f.name]}
                    placeholder={f.placeholder}
                    autoCapitalize="characters"
                    spellCheck={false}
                    className="font-mono text-sm!"
                  />
                </Field>
                <OverrideNote override={overrides[f.name]} />
              </div>
            ))}
          </div>
          <div className="grid gap-5 border-t border-hair pt-5 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <div>
              <Field id="booking_url" label="Booking URL" hint="Your Calendly / Cal.com page. Leave empty to use the built-in call request form." error={errors.booking_url}>
                <Input {...fieldAria("booking_url", errors.booking_url, true)} name="booking_url" type="url" defaultValue={settings.booking_url} placeholder="https://" />
              </Field>
              <OverrideNote override={overrides.booking_url} />
            </div>
            <Field id="booking_provider" label="Provider" error={errors.booking_provider}>
              <Select {...fieldAria("booking_provider", errors.booking_provider)} name="booking_provider" defaultValue={settings.booking_provider} options={toOptions(bookingProviderLabels)} />
            </Field>
          </div>
        </>
      )}
    </SectionForm>
  );
}

export function SiteForm({ settings, canEdit, overrides }: { settings: SiteSettings; canEdit: boolean; overrides: Overrides }) {
  const [title, setTitle] = useState(settings.default_seo_title);
  const [description, setDescription] = useState(settings.default_seo_description);
  return (
    <SectionForm title="Site settings" description="Defaults used when a page has no SEO fields of its own, plus social links." section="site" canEdit={canEdit}>
      {(errors) => (
        <>
          <Field id="default_seo_title" label="Default SEO title" required hint={`${title.length} / 60 characters`} error={errors.default_seo_title}>
            <Input {...fieldAria("default_seo_title", errors.default_seo_title, true)} name="default_seo_title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={70} />
          </Field>
          <Field id="default_seo_description" label="Default meta description" required hint={`${description.length} / 160 characters`} error={errors.default_seo_description}>
            <Input
              {...fieldAria("default_seo_description", errors.default_seo_description, true)}
              name="default_seo_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={170}
            />
          </Field>
          <div className="grid gap-5 border-t border-hair pt-5 sm:grid-cols-2">
            <div>
              <Field id="linkedin_url" label="LinkedIn URL" hint="Leave empty to hide the link." error={errors.linkedin_url}>
                <Input {...fieldAria("linkedin_url", errors.linkedin_url, true)} name="linkedin_url" type="url" defaultValue={settings.linkedin_url} placeholder="https://www.linkedin.com/company/…" />
              </Field>
              <OverrideNote override={overrides.linkedin_url} />
            </div>
            <div>
              <Field id="x_url" label="X (Twitter) URL" hint="Leave empty to hide the link." error={errors.x_url}>
                <Input {...fieldAria("x_url", errors.x_url, true)} name="x_url" type="url" defaultValue={settings.x_url} placeholder="https://x.com/…" />
              </Field>
              <OverrideNote override={overrides.x_url} />
            </div>
          </div>
        </>
      )}
    </SectionForm>
  );
}

export function ProfileForm({ name, email, role, editable }: { name: string; email: string; role: string; editable: boolean }) {
  return (
    <SectionForm
      title="Your profile"
      description="How you appear on notes and activity."
      canEdit={editable}
      action={updateProfileAction}
      footerNote={editable ? undefined : "The demo admin profile is fixed."}
    >
      {(errors) => (
        <>
          <Field id="full_name" label="Full name" required error={errors.full_name}>
            <Input {...fieldAria("full_name", errors.full_name)} name="full_name" defaultValue={name} maxLength={120} autoComplete="name" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-sm font-medium text-fg">Email</p>
              <p className="flex h-11 items-center rounded-[12px] bg-soft px-3.5 text-[15px] text-fg-2">{email}</p>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-fg">Role</p>
              <p className="flex h-11 items-center rounded-[12px] bg-soft px-3.5 text-[15px] text-fg-2">{role}</p>
            </div>
          </div>
          <p className="text-[13px] text-fg-2">Email and role are managed by an admin.</p>
        </>
      )}
    </SectionForm>
  );
}

/* ------------------------------------------------------------------ */

type DemoOp = "load" | "remove" | "install";

export function DataActions({ hasDemo, canManage }: { hasDemo: boolean; canManage: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [running, setRunning] = useState<DemoOp | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [, start] = useTransition();

  const ops: Record<DemoOp, () => Promise<ActionState>> = {
    load: loadDemoDataAction,
    remove: removeDemoDataAction,
    install: installStarterContentAction,
  };

  function run(op: DemoOp) {
    setRunning(op);
    start(async () => {
      const result = await ops[op]();
      toast(result.message ?? (result.status === "success" ? "Done." : "Something went wrong. Try again."), result.status === "success" ? "success" : "error");
      setRunning(null);
      setConfirmRemove(false);
      router.refresh();
    });
  }

  if (!canManage) return <Alert tone="info">Only admins can load or remove demo data.</Alert>;

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" icon={<Database className="size-4" />} onClick={() => run("load")} loading={running === "load"} disabled={running !== null || hasDemo} loadingText="Loading…">
        Load demo data
      </Button>
      <Button size="sm"
        variant="outline"
        className="text-danger hover:border-danger/40 hover:bg-danger-soft"
        icon={<Trash2 className="size-4" />}
        onClick={() => setConfirmRemove(true)}
        disabled={running !== null || !hasDemo}
      >
        Remove demo data
      </Button>
      <Button size="sm" variant="ghost" icon={<Download className="size-4" />} onClick={() => run("install")} loading={running === "install"} disabled={running !== null} loadingText="Installing…">
        Install starter content
      </Button>
      <ConfirmDialog
        open={confirmRemove}
        onCancel={() => setConfirmRemove(false)}
        onConfirm={() => run("remove")}
        pending={running === "remove"}
        title="Remove all demo data?"
        description="Deletes every record flagged as demo data — leads, audits, messages, bookings, notes, analytics events, demo case studies and testimonials. Real records are not touched. This can't be undone."
        confirmLabel="Remove demo data"
      />
    </div>
  );
}
