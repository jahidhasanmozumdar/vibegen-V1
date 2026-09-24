import { NextResponse, type NextRequest } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import type { ApiResponse } from "@/lib/data/types";
import { listLeads, parseLeadFilters } from "@/lib/services/admin/leads";
import { searchParamsFromUrl } from "@/lib/services/admin/query";

/** GET /api/leads — paginated leads list (admin only). Same query params as the admin page. */
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json<ApiResponse<never>>({ success: false, message: "Unauthorized." }, { status: 401 });

  try {
    const sp = searchParamsFromUrl(request.nextUrl);
    const data = await listLeads(parseLeadFilters(sp));
    return NextResponse.json<ApiResponse<typeof data>>({ success: true, data });
  } catch (error) {
    console.error("[api] leads failed", error instanceof Error ? error.message : error);
    return NextResponse.json<ApiResponse<never>>({ success: false, message: "Couldn't load leads right now." }, { status: 500 });
  }
}
