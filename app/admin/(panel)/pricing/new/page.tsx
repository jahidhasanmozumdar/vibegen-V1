import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { requireUser } from "@/lib/auth/session";
import { cmsList } from "@/lib/services/admin/cms";
import { PricingEditor } from "../pricing-editor";

export const metadata: Metadata = { title: "Add pricing plan" };

export default async function NewPricingPlanPage() {
  await requireUser("content:write");
  const plans = await cmsList("pricing_plans");
  const nextSortOrder = Math.min(100, plans.reduce((max, p) => Math.max(max, p.sort_order), 0) + 1);
  return (
    <>
      <PageHeader title="Add pricing plan" />
      <PricingEditor plan={null} nextSortOrder={nextSortOrder} />
    </>
  );
}
