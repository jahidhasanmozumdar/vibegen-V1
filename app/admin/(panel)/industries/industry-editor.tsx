"use client";

import { useActionState, useState } from "react";

import { ContentFormShell, EditorSection, type SaveState } from "@/components/admin/cms/content-form-shell";
import { RepeatableRows } from "@/components/admin/cms/repeatable-rows";
import { SeoFieldset } from "@/components/admin/cms/seo-fieldset";
import { Checkbox, Field, Input, Select, Textarea, fieldAria } from "@/components/ui/field";
import { saveIndustryAction } from "@/lib/actions/admin/cms-industries";
import { publishStatusLabels, serviceLabels, toOptions } from "@/lib/data/labels";
import { SERVICE_SLUGS, type Industry } from "@/lib/data/types";

const initial: SaveState = { status: "idle" };

export function IndustryEditor({ industry }: { industry: Industry }) {
  const [state, action, pending] = useActionState(saveIndustryAction, initial);
  const [name, setName] = useState(industry.name);
  const [summary, setSummary] = useState(industry.summary);
  const errors = state.fieldErrors ?? {};

  return (
    <ContentFormShell
      action={action}
      state={state}
      pending={pending}
      backHref="/admin/industries"
      aside={
        <>
          <EditorSection title="Publishing">
            <Field id="status" label="Status" required error={errors.status}>
              <Select {...fieldAria("status", errors.status)} name="status" defaultValue={industry.status} options={toOptions(publishStatusLabels)} />
            </Field>
            <div>
              <p className="mb-1.5 text-sm font-medium text-fg">Public URL</p>
              <p className="rounded-[12px] bg-soft px-3.5 py-2.5 font-mono text-[13px] text-fg-2">/industries/{industry.slug}</p>
            </div>
          </EditorSection>
          <EditorSection title="Recommended services">
            <div className="space-y-2">
              {SERVICE_SLUGS.map((slug) => (
                <Checkbox key={slug} name="services" value={slug} defaultChecked={industry.services.includes(slug)} label={serviceLabels[slug]} />
              ))}
            </div>
          </EditorSection>
        </>
      }
    >
      <input type="hidden" name="id" value={industry.id} />
      <EditorSection title="Overview">
        <Field id="name" label="Industry name" required error={errors.name}>
          <Input {...fieldAria("name", errors.name)} name="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="text-base! font-medium" />
        </Field>
        <Field id="headline" label="Headline" required error={errors.headline}>
          <Input {...fieldAria("headline", errors.headline)} name="headline" defaultValue={industry.headline} maxLength={200} />
        </Field>
        <Field id="summary" label="Summary" required error={errors.summary}>
          <Textarea {...fieldAria("summary", errors.summary)} name="summary" value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={600} className="min-h-24" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="examples" label="Example businesses" hint="One per line." error={errors.examples}>
            <Textarea {...fieldAria("examples", errors.examples, true)} name="examples" defaultValue={industry.examples.join("\n")} className="min-h-28" />
          </Field>
          <Field id="focus" label="What we focus on" hint="One per line." error={errors.focus}>
            <Textarea {...fieldAria("focus", errors.focus, true)} name="focus" defaultValue={industry.focus.join("\n")} className="min-h-28" />
          </Field>
        </div>
      </EditorSection>

      <EditorSection title="Challenges, approach & FAQ">
        <RepeatableRows
          name="challenges_json"
          label="Common challenges"
          addLabel="Add challenge"
          error={errors.challenges_json}
          initial={industry.challenges}
          fields={[
            { key: "title", label: "Challenge" },
            { key: "body", label: "Explanation", multiline: true },
          ]}
        />
        <RepeatableRows
          name="approach_json"
          label="Our approach"
          addLabel="Add step"
          error={errors.approach_json}
          initial={industry.approach}
          fields={[
            { key: "title", label: "Step" },
            { key: "body", label: "What we do", multiline: true },
          ]}
        />
        <RepeatableRows
          name="faqs_json"
          label="FAQ"
          addLabel="Add question"
          max={30}
          error={errors.faqs_json}
          initial={industry.faqs}
          fields={[
            { key: "question", label: "Question" },
            { key: "answer", label: "Answer", multiline: true },
          ]}
        />
      </EditorSection>

      <SeoFieldset defaults={industry} errors={errors} fallbackTitle={name} fallbackDescription={summary} path={`/industries/${industry.slug}`} />
    </ContentFormShell>
  );
}
