import { NextResponse } from "next/server";

import type { ApiResponse, CaseStudy } from "@/lib/data/types";
import { getCaseStudies } from "@/lib/services/content";

export const revalidate = 300;

/** Published case studies (public). Illustrative ones keep their is_demo flag so clients can label them. */
export async function GET() {
  try {
    const data = await getCaseStudies();
    return NextResponse.json<ApiResponse<CaseStudy[]>>({ success: true, data });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, message: "Case studies are unavailable right now." }, { status: 500 });
  }
}
