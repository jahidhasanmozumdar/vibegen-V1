import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { deleteTestimonialAction, setTestimonialStatusAction } from "@/lib/actions/admin/cms-testimonials";
import { requireUser } from "@/lib/auth/session";
import { cmsGet } from "@/lib/services/admin/cms";
import { formatDateTime } from "@/lib/utils/format";
import { TestimonialEditor } from "../testimonial-editor";

export const metadata: Metadata = { title: "Edit testimonial" };

export default async function EditTestimonialPage(props: PageProps<"/admin/testimonials/[id]">) {
  await requireUser("content:write");
  const { id } = await props.params;
  const item = await cmsGet("testimonials", id);
  if (!item) notFound();

  return (
    <>
      <PageHeader
        title={item.name}
        demo={item.is_demo}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusBadge kind="publish" value={item.status} />
            <span>Last updated {formatDateTime(item.updated_at)}</span>
          </span>
        }
      />
      <TestimonialEditor
        item={item}
        onDelete={deleteTestimonialAction.bind(null, item.id)}
        onToggle={setTestimonialStatusAction.bind(null, item.id, item.status === "published" ? "draft" : "published")}
      />
    </>
  );
}
