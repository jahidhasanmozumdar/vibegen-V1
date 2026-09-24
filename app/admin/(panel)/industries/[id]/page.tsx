import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { cmsGet } from "@/lib/services/admin/cms";
import { formatDateTime } from "@/lib/utils/format";
import { IndustryEditor } from "../industry-editor";

export const metadata: Metadata = { title: "Edit industry" };

export default async function EditIndustryPage(props: PageProps<"/admin/industries/[id]">) {
  await requireUser("content:write");
  const { id } = await props.params;
  const industry = await cmsGet("industries", id);
  if (!industry) notFound();

  return (
    <>
      <PageHeader
        title={industry.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusBadge kind="publish" value={industry.status} />
            <span>Last updated {formatDateTime(industry.updated_at)}</span>
          </span>
        }
        actions={
          <ButtonLink href={`/industries/${industry.slug}`} target="_blank" variant="outline" size="sm" iconRight={<ExternalLink className="size-3.5" />}>
            View live
          </ButtonLink>
        }
      />
      <IndustryEditor industry={industry} />
    </>
  );
}
