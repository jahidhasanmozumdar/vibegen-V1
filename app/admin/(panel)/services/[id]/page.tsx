import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { cmsGet } from "@/lib/services/admin/cms";
import { formatDateTime } from "@/lib/utils/format";
import { ServiceEditor } from "../service-editor";

export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage(props: PageProps<"/admin/services/[id]">) {
  await requireUser("content:write");
  const { id } = await props.params;
  const service = await cmsGet("services", id);
  if (!service) notFound();

  return (
    <>
      <PageHeader
        title={service.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusBadge kind="publish" value={service.status} />
            <span>Last updated {formatDateTime(service.updated_at)}</span>
          </span>
        }
        actions={
          <ButtonLink href={`/services/${service.slug}`} target="_blank" variant="outline" size="sm" iconRight={<ExternalLink className="size-3.5" />}>
            View live
          </ButtonLink>
        }
      />
      <ServiceEditor service={service} />
    </>
  );
}
