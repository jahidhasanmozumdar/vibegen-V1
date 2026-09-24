import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { requireUser } from "@/lib/auth/session";
import { cmsList } from "@/lib/services/admin/cms";
import { BlogEditor } from "../blog-editor";

export const metadata: Metadata = { title: "New blog post" };

export default async function NewBlogPostPage() {
  const user = await requireUser("content:write");
  const categories = await cmsList("blog_categories", "name", true);
  return (
    <>
      <PageHeader title="New blog post" description="Drafts stay private until you publish or schedule them." />
      <BlogEditor post={null} categories={categories} defaultAuthor={user.name} />
    </>
  );
}
