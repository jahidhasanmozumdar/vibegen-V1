"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { Plus } from "lucide-react";

import { submitKeepingValues, useActionStateToast } from "@/components/admin/use-action";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea, fieldAria } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { createLeadAction } from "@/lib/actions/admin/leads";
import { countryOptions, industryOptions, serviceLabels, toOptions } from "@/lib/data/labels";
import type { ActionState } from "@/lib/data/types";

const initial: ActionState<{ id: string }> = { status: "idle" };

function LeadForm({ onDone }: { onDone: (id: string) => void }) {
  const [state, action, pending] = useActionState(createLeadAction, initial);
  const e = state.fieldErrors ?? {};
  useActionStateToast(state, (s) => s.data && onDone(s.data.id));

  return (
    <form onSubmit={submitKeepingValues(action)} noValidate className="space-y-4">
      {state.status === "error" && state.message && <Alert tone="danger">{state.message}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="lead-name" label="Full name" required error={e.full_name}>
          <Input {...fieldAria("lead-name", e.full_name)} name="full_name" autoComplete="off" required />
        </Field>
        <Field id="lead-email" label="Email" required error={e.email}>
          <Input {...fieldAria("lead-email", e.email)} name="email" type="email" autoComplete="off" required />
        </Field>
        <Field id="lead-company" label="Company" error={e.company}>
          <Input {...fieldAria("lead-company", e.company)} name="company" />
        </Field>
        <Field id="lead-website" label="Website" error={e.website} hint="e.g. acme.com">
          <Input {...fieldAria("lead-website", e.website, true)} name="website" inputMode="url" />
        </Field>
        <Field id="lead-country" label="Country" error={e.country}>
          <Select {...fieldAria("lead-country", e.country)} name="country" placeholder="Choose…" options={countryOptions.map((c) => ({ value: c, label: c }))} />
        </Field>
        <Field id="lead-industry" label="Industry" error={e.industry}>
          <Select {...fieldAria("lead-industry", e.industry)} name="industry" placeholder="Choose…" options={industryOptions.map((c) => ({ value: c, label: c }))} />
        </Field>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-fg">
          Services of interest <span className="ml-1.5 text-xs font-normal text-fg-3">Optional</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {toOptions(serviceLabels).map((s) => (
            <Checkbox key={s.value} name="services" value={s.value} label={s.label} />
          ))}
        </div>
      </fieldset>
      <Field id="lead-message" label="Context" error={e.message} hint="Where the lead came from, what they need.">
        <Textarea {...fieldAria("lead-message", e.message, true)} name="message" rows={3} />
      </Field>
      <div className="flex justify-end gap-2 border-t border-hair pt-4">
        <Button size="sm" type="submit" loading={pending} loadingText="Adding…">
          Add lead
        </Button>
      </div>
    </form>
  );
}

/** "Add lead" button + modal for manually entered leads (source: Direct, form: Added manually). */
export function AddLeadButton({ variant = "primary" }: { variant?: "primary" | "outline" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function close() {
    setOpen(false);
    setFormKey((k) => k + 1);
  }

  return (
    <>
      <Button variant={variant} size="sm" icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => setOpen(true)}>
        Add lead
      </Button>
      <Modal open={open} onClose={close} title="Add a lead" description="For leads that came in by phone, email or referral. It's saved with source Direct." size="lg">
        <LeadForm
          key={formKey}
          onDone={(id) => {
            close();
            router.push(`/admin/leads/${id}`);
          }}
        />
      </Modal>
    </>
  );
}
