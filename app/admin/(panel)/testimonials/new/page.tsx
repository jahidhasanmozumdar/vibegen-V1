import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { requireUser } from "@/lib/auth/session";
import { TestimonialEditor } from "../testimonial-editor";

export const metadata: Metadata = { title: "New testimonial" };

export default async function NewTestimonialPage() {
  await requireUser("content:write");
  return (
    <>
      <PageHeader title="New testimonial" />
      <TestimonialEditor item={null} />
    </>
  );
}
