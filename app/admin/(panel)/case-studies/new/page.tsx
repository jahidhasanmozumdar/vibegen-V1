import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { requireUser } from "@/lib/auth/session";
import { cmsList } from "@/lib/services/admin/cms";
import { CaseStudyEditor } from "../case-study-editor";

export const metadata: Metadata = { title: "New case study" };

export default async function NewCaseStudyPage() {
  await requireUser("content:write");
  const testimonials = await cmsList("testimonials", "name", true);
  return (
    <>
      <PageHeader title="New case study" description="Real results need client approval. Illustrative examples must stay flagged as demo data." />
      <CaseStudyEditor item={null} testimonials={testimonials} />
    </>
  );
}
