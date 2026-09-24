import { NextResponse } from "next/server";

import type { ApiResponse, BlogPost } from "@/lib/data/types";
import { getPublishedPosts } from "@/lib/services/content";

export const revalidate = 300;

/** Published blog posts (public). */
export async function GET() {
  try {
    const data = await getPublishedPosts();
    return NextResponse.json<ApiResponse<BlogPost[]>>({ success: true, data });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, message: "The blog is unavailable right now." }, { status: 500 });
  }
}
