import { NextResponse, type NextRequest } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import type { ApiResponse } from "@/lib/data/types";
import { getAnalyticsSummary } from "@/lib/services/admin/analytics";
import { parseDateRange } from "@/lib/services/admin/date-range";
import { searchParamsFromUrl } from "@/lib/services/admin/query";

/** GET /api/analytics?range=7d|30d|90d|6m|12m|custom&from=&to= — analytics summary (admin only). Same query params as the admin page. */
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json<ApiResponse<never>>({ success: false, message: "Unauthorized." }, { status: 401 });

  try {
    const sp = searchParamsFromUrl(request.nextUrl);
    const data = await getAnalyticsSummary(parseDateRange(sp, "90d"));
    return NextResponse.json<ApiResponse<typeof data>>({ success: true, data });
  } catch (error) {
    console.error("[api] analytics failed", error instanceof Error ? error.message : error);
    return NextResponse.json<ApiResponse<never>>({ success: false, message: "Couldn't load analytics right now." }, { status: 500 });
  }
}
