"use client";

import { useActionState, useState } from "react";

import { ContentFormShell, EditorSection, useSyncedState, type SaveState } from "@/components/admin/cms/content-form-shell";
import { DeleteButton } from "@/components/admin/cms/row-actions";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Field, Input, Select, Textarea, fieldAria } from "@/components/ui/field";
import { saveTestimonialAction } from "@/lib/actions/admin/cms-testimonials";
import { publishStatusLabels, toOptions } from "@/lib/data/labels";
import type { PublishStatus, Testimonial } from "@/lib/data/types";

const initial: SaveState = { status: "idle" };

export function TestimonialEditor({
  item,
  onDelete,
  onToggle,
}: {
  item: Testimonial | null;
  onDelete?: () => Promise<SaveState>;
  onToggle?: () => Promise<SaveState>;
}) {
  const [state, action, pending] = useActionState(saveTestimonialAction, initial);
  const [status, setStatus] = useSyncedState<PublishStatus>(item?.status ?? "draft");
  const [quote, setQuote] = useState(item?.quote ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const [role, setRole] = useState(item?.role ?? "");
  const [company, setCompany] = useState(item?.company ?? "");
  const [isDemo, setIsDemo] = useState(item?.is_demo ?? false);
  const errors = state.fieldErrors ?? {};

  return (
    <ContentFormShell
      action={action}
      state={state}
      pending={pending}
      backHref="/admin/testimonials"
      isNew={!item}
      editHref={(id) => `/admin/testimonials/${id}`}
      publish={item && onToggle ? { published: item.status === "published", run: onToggle } : undefined}
      extraActions={item && onDelete ? <DeleteButton label={item.name} onDelete={onDelete} redirectTo="/admin/testimonials" /> : undefined}
      aside={
        <>
          <EditorSection title="Publishing">
            <Field id="status" label="Status" required error={errors.status}>
              <Select {...fieldAria("status", errors.status)} name="status" value={status} onChange={(e) => setStatus(e.target.value as PublishStatus)} options={toOptions(publishStatusLabels)} />
            </Field>
            <Checkbox
              name="is_demo"
              checked={isDemo}
              onChange={(e) => setIsDemo(e.target.checked)}
              label="Demo testimonial"
              description="Sample content for demos. It is labelled as demo data and removed by “Remove demo data”."
            />
          </EditorSection>
          <EditorSection title="Preview">
            <figure className="rounded-[10px] border border-hair bg-soft p-4">
              <blockquote className="text-[15px] leading-relaxed text-fg">“{quote || "The quote appears here."}”</blockquote>
              <figcaption className="mt-3 text-[13px] text-fg-2">
                <span className="font-medium text-fg">{name || "Name"}</span>
                {(role || company) && <span> · {[role, company].filter(Boolean).join(", ")}</span>}
              </figcaption>
            </figure>
          </EditorSection>
        </>
      }
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <Alert tone="warning" title="Only publish real testimonials you have permission to use.">
        Keep the client&apos;s written approval on file. Never edit a quote so it says something they didn&apos;t.
      </Alert>
      <EditorSection title="Testimonial">
        <Field id="quote" label="Quote" required error={errors.quote}>
          <Textarea {...fieldAria("quote", errors.quote)} name="quote" value={quote} onChange={(e) => setQuote(e.target.value)} maxLength={1200} className="min-h-32" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Name" required error={errors.name}>
            <Input {...fieldAria("name", errors.name)} name="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </Field>
          <Field id="role" label="Role" error={errors.role}>
            <Input {...fieldAria("role", errors.role)} name="role" value={role} onChange={(e) => setRole(e.target.value)} maxLength={120} placeholder="Head of Growth" />
          </Field>
          <Field id="company" label="Company" error={errors.company}>
            <Input {...fieldAria("company", errors.company)} name="company" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={160} />
          </Field>
          <Field id="photo_url" label="Photo URL" hint="Square, at least 160 px." error={errors.photo_url}>
            <Input {...fieldAria("photo_url", errors.photo_url, true)} name="photo_url" type="url" defaultValue={item?.photo_url ?? ""} placeholder="https://" />
          </Field>
        </div>
      </EditorSection>
    </ContentFormShell>
  );
}
