"use client";

import { useActionState, useState } from "react";

import { ContentFormShell, EditorSection, useSyncedState, type SaveState } from "@/components/admin/cms/content-form-shell";
import { DateTimeField } from "@/components/admin/cms/datetime-field";
import { RepeatableRows } from "@/components/admin/cms/repeatable-rows";
import { DeleteButton } from "@/components/admin/cms/row-actions";
import { SeoFieldset } from "@/components/admin/cms/seo-fieldset";
import { TitleSlugFields } from "@/components/admin/cms/slug-input";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Field, Input, Select, Textarea, fieldAria } from "@/components/ui/field";
import { saveCaseStudyAction } from "@/lib/actions/admin/cms-case-studies";
import { industryLabels, publishStatusLabels, serviceLabels, toOptions } from "@/lib/data/labels";
import { SERVICE_SLUGS, type CaseStudy, type PublishStatus, type Testimonial } from "@/lib/data/types";

const initial: SaveState = { status: "idle" };

const NARRATIVE = [
  { name: "challenge", label: "Challenge", hint: "What wasn't working, and why it mattered." },
  { name: "strategy", label: "Strategy", hint: "The plan and the reasoning behind it." },
  { name: "execution", label: "Execution", hint: "What was actually built or changed." },
  { name: "results", label: "Results", hint: "Outcomes. Only claim numbers you can prove." },
] as const;

export function CaseStudyEditor({
  item,
  testimonials,
  onDelete,
  onToggle,
}: {
  item: CaseStudy | null;
  testimonials: Pick<Testimonial, "id" | "name" | "company" | "is_demo">[];
  onDelete?: () => Promise<SaveState>;
  onToggle?: () => Promise<SaveState>;
}) {
  const [state, action, pending] = useActionState(saveCaseStudyAction, initial);
  const [status, setStatus] = useSyncedState<PublishStatus>(item?.status ?? "draft");
  const [isDemo, setIsDemo] = useState(item?.is_demo ?? false);
  const [title, setTitle] = useState(item?.title ?? "");
  const errors = state.fieldErrors ?? {};

  return (
    <ContentFormShell
      action={action}
      state={state}
      pending={pending}
      backHref="/admin/case-studies"
      isNew={!item}
      editHref={(id) => `/admin/case-studies/${id}`}
      publish={item && onToggle ? { published: item.status === "published", run: onToggle } : undefined}
      extraActions={item && onDelete ? <DeleteButton label={item.title} onDelete={onDelete} redirectTo="/admin/case-studies" /> : undefined}
      aside={
        <>
          <EditorSection title="Publishing">
            <Field id="status" label="Status" required error={errors.status}>
              <Select
                {...fieldAria("status", errors.status)}
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PublishStatus)}
                options={toOptions(publishStatusLabels)}
              />
            </Field>
            <DateTimeField name="published_at" label="Published date" defaultValue={item?.published_at} error={errors.published_at} hint="Set automatically on first publish." />
          </EditorSection>

          <EditorSection title="Demo flag">
            <Checkbox
              name="is_demo"
              checked={isDemo}
              onChange={(e) => setIsDemo(e.target.checked)}
              label="This is an illustrative example (demo data)"
              description="When on, the public page shows 'Illustrative Example — Demo Data'. Turn off only for real, approved client results."
            />
            {!isDemo && (
              <Alert tone="warning" title="Real client result">
                Publish only with the client&apos;s written approval, and only numbers you can back up.
              </Alert>
            )}
          </EditorSection>

          <EditorSection title="Details">
            <Field id="industry" label="Industry" error={errors.industry}>
              <Select {...fieldAria("industry", errors.industry)} name="industry" defaultValue={item?.industry ?? ""} placeholder="Not set" options={toOptions(industryLabels)} />
            </Field>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-fg">Services</legend>
              <div className="space-y-2">
                {SERVICE_SLUGS.map((slug) => (
                  <Checkbox key={slug} name="services" value={slug} defaultChecked={item?.services.includes(slug)} label={serviceLabels[slug]} />
                ))}
              </div>
            </fieldset>
            <Field id="duration" label="Duration" hint="e.g. 12 weeks" error={errors.duration}>
              <Input {...fieldAria("duration", errors.duration, true)} name="duration" defaultValue={item?.duration ?? ""} maxLength={80} />
            </Field>
            <Field id="ad_spend" label="Ad spend" hint="e.g. $15k / month" error={errors.ad_spend}>
              <Input {...fieldAria("ad_spend", errors.ad_spend, true)} name="ad_spend" defaultValue={item?.ad_spend ?? ""} maxLength={80} />
            </Field>
            <Field id="testimonial_id" label="Testimonial" hint="Shown alongside the case study." error={errors.testimonial_id}>
              <Select
                {...fieldAria("testimonial_id", errors.testimonial_id, true)}
                name="testimonial_id"
                defaultValue={item?.testimonial_id ?? ""}
                placeholder="None"
                options={testimonials.map((t) => ({ value: t.id, label: `${t.name}${t.company ? ` — ${t.company}` : ""}${t.is_demo ? " (demo)" : ""}` }))}
              />
            </Field>
          </EditorSection>
        </>
      }
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <EditorSection title="Case study">
        <TitleSlugFields defaultTitle={item?.title} defaultSlug={item?.slug} prefix="/case-studies/" errors={errors} onTitleChange={setTitle} />
        <Field id="client" label="Client" required hint={isDemo ? "For demo examples use a generic label, e.g. 'Demo SaaS company'." : "The client's name as approved for publication."} error={errors.client}>
          <Input {...fieldAria("client", errors.client, true)} name="client" defaultValue={item?.client ?? ""} maxLength={160} />
        </Field>
        <Field id="excerpt" label="Excerpt" required hint="Shown on the case study index." error={errors.excerpt}>
          <Textarea {...fieldAria("excerpt", errors.excerpt, true)} name="excerpt" defaultValue={item?.excerpt ?? ""} maxLength={320} className="min-h-20" />
        </Field>
      </EditorSection>

      <EditorSection title="Story" description="Separate paragraphs with a blank line.">
        {NARRATIVE.map((f) => (
          <Field key={f.name} id={f.name} label={f.label} required hint={f.hint} error={errors[f.name]}>
            <Textarea {...fieldAria(f.name, errors[f.name], true)} name={f.name} defaultValue={item?.[f.name] ?? ""} maxLength={6000} className="min-h-36" />
          </Field>
        ))}
      </EditorSection>

      <EditorSection title="Metrics & media">
        <RepeatableRows
          name="metrics_json"
          label="Metrics"
          description="Before/after figures. Leave a value empty if it doesn't apply."
          addLabel="Add metric"
          max={12}
          error={errors.metrics_json}
          initial={item?.metrics ?? []}
          fields={[
            { key: "label", label: "Label", placeholder: "Cost per qualified lead", span: 4 },
            { key: "before", label: "Before", placeholder: "$210", nullable: true, span: 4 },
            { key: "after", label: "After", placeholder: "$140", nullable: true, span: 4 },
            { key: "note", label: "Note", placeholder: "Optional context", nullable: true, span: 12 },
          ]}
        />
        <Field id="images" label="Images" hint="One image URL per line." error={errors.images}>
          <Textarea {...fieldAria("images", errors.images, true)} name="images" defaultValue={item?.images.join("\n") ?? ""} className="min-h-24 font-mono text-[13px]!" placeholder="https://" />
        </Field>
      </EditorSection>

      <SeoFieldset defaults={item ?? undefined} errors={errors} fallbackTitle={title} path={`/case-studies/${item?.slug ?? ""}`} />
    </ContentFormShell>
  );
}
