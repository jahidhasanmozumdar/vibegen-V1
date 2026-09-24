"use client";

import { useActionState, useState } from "react";
import { Check } from "lucide-react";

import { ContentFormShell, EditorSection, useSyncedState, type SaveState } from "@/components/admin/cms/content-form-shell";
import { DeleteButton } from "@/components/admin/cms/row-actions";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Field, Input, Textarea, fieldAria } from "@/components/ui/field";
import { savePricingPlanAction } from "@/lib/actions/admin/cms-pricing";
import type { PricingPlan } from "@/lib/data/types";
import { formatCurrency } from "@/lib/utils/format";

const initial: SaveState = { status: "idle" };

export function PricingEditor({
  plan,
  nextSortOrder = 0,
  onDelete,
  onToggle,
}: {
  plan: PricingPlan | null;
  nextSortOrder?: number;
  onDelete?: () => Promise<SaveState>;
  onToggle?: () => Promise<SaveState>;
}) {
  const [state, action, pending] = useActionState(savePricingPlanAction, initial);
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [price, setPrice] = useState(String(plan?.monthly_price ?? ""));
  const [setup, setSetup] = useState(String(plan?.setup_fee ?? ""));
  const [spend, setSpend] = useState(plan?.ad_spend_range ?? "");
  const [features, setFeatures] = useState(plan?.features.join("\n") ?? "");
  const [ctaLabel, setCtaLabel] = useState(plan?.cta_label ?? "Get a Free Growth Audit");
  const [badge, setBadge] = useState(plan?.badge ?? "");
  const [active, setActive] = useSyncedState(plan?.active ?? true);
  const errors = state.fieldErrors ?? {};
  const featureList = features.split("\n").map((f) => f.trim()).filter(Boolean);
  const money = (v: string) => (v.trim() === "" || Number.isNaN(Number(v)) ? "—" : formatCurrency(Number(v)));

  return (
    <ContentFormShell
      action={action}
      state={state}
      pending={pending}
      backHref="/admin/pricing"
      isNew={!plan}
      editHref={(id) => `/admin/pricing/${id}`}
      publish={plan && onToggle ? { published: plan.active, publishLabel: "Show on site", unpublishLabel: "Hide from site", run: onToggle } : undefined}
      extraActions={plan && onDelete ? <DeleteButton label={plan.name} onDelete={onDelete} redirectTo="/admin/pricing" /> : undefined}
      aside={
        <EditorSection title="Live preview">
          <div className="rounded-[16px] border border-hair bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-lg font-semibold">{name || "Plan name"}</p>
              {badge && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">{badge}</span>}
            </div>
            <p className="mt-1 text-[13px] text-fg-2">{description || "Short description of who this plan is for."}</p>
            <p className="tabular mt-4 text-3xl font-semibold">
              {money(price)}
              <span className="ml-1 text-sm font-normal text-fg-2">/ month</span>
            </p>
            <p className="tabular mt-1 text-[13px] text-fg-2">
              {setup.trim() && Number(setup) > 0 ? `+ ${money(setup)} one-time setup` : "No setup fee"}
            </p>
            {spend && <p className="mt-1 text-[13px] text-fg-2">Recommended ad spend: {spend}</p>}
            <ul className="mt-4 space-y-1.5 text-[13px]">
              {featureList.slice(0, 8).map((f, i) => (
                <li key={i} className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-fg" strokeWidth={2.75} aria-hidden="true" />
                  {f}
                </li>
              ))}
              {featureList.length > 8 && <li className="text-fg-2">+ {featureList.length - 8} more</li>}
            </ul>
            <span className="mt-5 flex h-9 items-center justify-center rounded-md bg-accent text-[13px] font-medium text-white">{ctaLabel || "CTA label"}</span>
          </div>
          {!active && <p className="text-[13px] text-fg-2">Inactive plans are hidden from /pricing.</p>}
        </EditorSection>
      }
    >
      {plan && <input type="hidden" name="id" value={plan.id} />}
      <Alert tone="warning" title="Pricing changes go live immediately.">
        Saving an active plan updates the public pricing page right away. Double-check numbers before you save.
      </Alert>

      <EditorSection title="Plan">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Package name" required error={errors.name}>
            <Input {...fieldAria("name", errors.name)} name="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </Field>
          <Field id="badge" label="Badge" hint="e.g. Most popular. Leave empty for none." error={errors.badge}>
            <Input {...fieldAria("badge", errors.badge, true)} name="badge" value={badge} onChange={(e) => setBadge(e.target.value)} maxLength={40} />
          </Field>
        </div>
        <Field id="description" label="Description" required error={errors.description}>
          <Textarea {...fieldAria("description", errors.description)} name="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} className="min-h-20" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="monthly_price" label="Monthly price (USD)" required error={errors.monthly_price}>
            <Input {...fieldAria("monthly_price", errors.monthly_price)} name="monthly_price" type="number" min={0} step={1} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className="tabular" />
          </Field>
          <Field id="setup_fee" label="Setup fee (USD)" required hint="0 for none." error={errors.setup_fee}>
            <Input {...fieldAria("setup_fee", errors.setup_fee, true)} name="setup_fee" type="number" min={0} step={1} inputMode="numeric" value={setup} onChange={(e) => setSetup(e.target.value)} className="tabular" />
          </Field>
          <Field id="sort_order" label="Order" required hint="Lower shows first." error={errors.sort_order}>
            <Input {...fieldAria("sort_order", errors.sort_order, true)} name="sort_order" type="number" min={0} max={100} step={1} defaultValue={plan?.sort_order ?? nextSortOrder} className="tabular" />
          </Field>
        </div>
        <Field id="ad_spend_range" label="Recommended ad spend" required hint="e.g. $2,500 – $10,000 / month" error={errors.ad_spend_range}>
          <Input {...fieldAria("ad_spend_range", errors.ad_spend_range, true)} name="ad_spend_range" value={spend} onChange={(e) => setSpend(e.target.value)} maxLength={80} />
        </Field>
        <Field id="features" label="Features" hint="One per line." error={errors.features}>
          <Textarea {...fieldAria("features", errors.features, true)} name="features" value={features} onChange={(e) => setFeatures(e.target.value)} className="min-h-40" />
        </Field>
      </EditorSection>

      <EditorSection title="Call to action">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="cta_label" label="CTA label" required error={errors.cta_label}>
            <Input {...fieldAria("cta_label", errors.cta_label)} name="cta_label" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} maxLength={60} />
          </Field>
          <Field id="cta_href" label="CTA link" required hint="A site path like /free-growth-audit, or an https:// URL." error={errors.cta_href}>
            <Input {...fieldAria("cta_href", errors.cta_href, true)} name="cta_href" defaultValue={plan?.cta_href ?? "/free-growth-audit"} maxLength={200} />
          </Field>
        </div>
        <Checkbox
          name="active"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          label="Active — show this plan on the pricing page"
        />
      </EditorSection>
    </ContentFormShell>
  );
}
