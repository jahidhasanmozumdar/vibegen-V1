import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { deletePricingPlanAction, setPricingPlanActiveAction } from "@/lib/actions/admin/cms-pricing";
import { requireUser } from "@/lib/auth/session";
import { cmsGet } from "@/lib/services/admin/cms";
import { formatDateTime } from "@/lib/utils/format";
import { PricingEditor } from "../pricing-editor";

export const metadata: Metadata = { title: "Edit pricing plan" };

export default async function EditPricingPlanPage(props: PageProps<"/admin/pricing/[id]">) {
  await requireUser("content:write");
  const { id } = await props.params;
  const plan = await cmsGet("pricing_plans", id);
  if (!plan) notFound();

  return (
    <>
      <PageHeader
        title={plan.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge tone={plan.active ? "success" : "neutral"} dot>
              {plan.active ? "Active" : "Hidden"}
            </Badge>
            <span>Last updated {formatDateTime(plan.updated_at)}</span>
          </span>
        }
      />
      <PricingEditor plan={plan} onDelete={deletePricingPlanAction.bind(null, plan.id)} onToggle={setPricingPlanActiveAction.bind(null, plan.id, !plan.active)} />
    </>
  );
}
