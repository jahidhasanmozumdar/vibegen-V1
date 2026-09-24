"use client";

import { useActionState, useState } from "react";

import { ContentFormShell, EditorSection, type SaveState } from "@/components/admin/cms/content-form-shell";
import { RepeatableRows } from "@/components/admin/cms/repeatable-rows";
import { SeoFieldset } from "@/components/admin/cms/seo-fieldset";
import { Field, Input, Select, Textarea, fieldAria } from "@/components/ui/field";
import { saveServiceAction } from "@/lib/actions/admin/cms-services";
import { publishStatusLabels, toOptions } from "@/lib/data/labels";
import type { Service } from "@/lib/data/types";

const initial: SaveState = { status: "idle" };

const LIST_FIELDS = [
  { name: "capabilities", label: "Capabilities", hint: "One per line. Short noun phrases, e.g. “Server-side conversion tracking”." },
  { name: "included", label: "What's included", hint: "One per line." },
  { name: "not_included", label: "Not included", hint: "One per line. Setting expectations early avoids scope creep." },
] as const;

export function ServiceEditor({ service }: { service: Service }) {
  const [state, action, pending] = useActionState(saveServiceAction, initial);
  const [name, setName] = useState(service.name);
  const [summary, setSummary] = useState(service.summary);
  const errors = state.fieldErrors ?? {};

  return (
    <ContentFormShell
      action={action}
      state={state}
      pending={pending}
      backHref="/admin/services"
      aside={
        <>
          <EditorSection title="Publishing">
            <Field id="status" label="Status" required hint="Draft services disappear from /services and the navigation fallbacks." error={errors.status}>
              <Select {...fieldAria("status", errors.status, true)} name="status" defaultValue={service.status} options={toOptions(publishStatusLabels)} />
            </Field>
            <div>
              <p className="mb-1.5 text-sm font-medium text-fg">Public URL</p>
              <p className="rounded-[12px] bg-soft px-3.5 py-2.5 font-mono text-[13px] text-fg-2">/services/{service.slug}</p>
              <p className="mt-1.5 text-[13px] text-fg-2">Service URLs are fixed so links and ads never break.</p>
            </div>
          </EditorSection>
        </>
      }
    >
      <input type="hidden" name="id" value={service.id} />
      <EditorSection title="Overview">
        <Field id="name" label="Service name" required error={errors.name}>
          <Input {...fieldAria("name", errors.name)} name="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="text-base! font-medium" />
        </Field>
        <Field id="tagline" label="Tagline" required hint="One line under the page title." error={errors.tagline}>
          <Input {...fieldAria("tagline", errors.tagline, true)} name="tagline" defaultValue={service.tagline} maxLength={200} />
        </Field>
        <Field id="summary" label="Summary" required hint="Used on cards and in the services overview." error={errors.summary}>
          <Textarea {...fieldAria("summary", errors.summary, true)} name="summary" value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={400} className="min-h-20" />
        </Field>
        <Field id="description" label="Description" required hint="Separate paragraphs with a blank line." error={errors.description}>
          <Textarea {...fieldAria("description", errors.description, true)} name="description" defaultValue={service.description} maxLength={6000} className="min-h-40" />
        </Field>
      </EditorSection>

      <EditorSection title="Scope">
        {LIST_FIELDS.map((f) => (
          <Field key={f.name} id={f.name} label={f.label} hint={f.hint} error={errors[f.name]}>
            <Textarea {...fieldAria(f.name, errors[f.name], true)} name={f.name} defaultValue={service[f.name].join("\n")} className="min-h-28" />
          </Field>
        ))}
      </EditorSection>

      <EditorSection title="Features, benefits & FAQ">
        <RepeatableRows
          name="features_json"
          label="Features"
          addLabel="Add feature"
          error={errors.features_json}
          initial={service.features}
          fields={[
            { key: "title", label: "Title" },
            { key: "body", label: "Description", multiline: true },
          ]}
        />
        <RepeatableRows
          name="benefits_json"
          label="Benefits"
          addLabel="Add benefit"
          error={errors.benefits_json}
          initial={service.benefits}
          fields={[
            { key: "title", label: "Title" },
            { key: "body", label: "Description", multiline: true },
          ]}
        />
        <RepeatableRows
          name="faqs_json"
          label="FAQ"
          addLabel="Add question"
          max={30}
          error={errors.faqs_json}
          initial={service.faqs}
          fields={[
            { key: "question", label: "Question" },
            { key: "answer", label: "Answer", multiline: true },
          ]}
        />
      </EditorSection>

      <SeoFieldset defaults={service} errors={errors} fallbackTitle={name} fallbackDescription={summary} path={`/services/${service.slug}`} />
    </ContentFormShell>
  );
}
