import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { deleteCaseStudyAction, setCaseStudyStatusAction } from "@/lib/actions/admin/cms-case-studies";
import { requireUser } from "@/lib/auth/session";
import { cmsGet, cmsList } from "@/lib/services/admin/cms";
import { formatDateTime } from "@/lib/utils/format";
import { CaseStudyEditor } from "../case-study-editor";

export const metadata: Metadata = { title: "Edit case study" };

export default async function EditCaseStudyPage(props: PageProps<"/admin/case-studies/[id]">) {
  await requireUser("content:write");
  const { id } = await props.params;
  const [item, testimonials] = await Promise.all([cmsGet("case_studies", id), cmsList("testimonials", "name", true)]);
  if (!item) notFound();

  return (
    <>
      <PageHeader
        title={item.title}
        demo={item.is_demo}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusBadge kind="publish" value={item.status} />
            <span>Last updated {formatDateTime(item.updated_at)}</span>
          </span>
        }
        actions={
          item.status === "published" ? (
            <ButtonLink href={`/case-studies/${item.slug}`} target="_blank" variant="outline" size="sm" iconRight={<ExternalLink className="size-3.5" />}>
              View live
            </ButtonLink>
          ) : null
        }
      />
      <CaseStudyEditor
        item={item}
        testimonials={testimonials}
        onDelete={deleteCaseStudyAction.bind(null, item.id)}
        onToggle={setCaseStudyStatusAction.bind(null, item.id, item.status === "published" ? "draft" : "published")}
      />
    </>
  );
}
