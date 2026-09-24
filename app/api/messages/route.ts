import { NextResponse, type NextRequest } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import type { ApiResponse } from "@/lib/data/types";
import { listMessages, parseMessageFilters } from "@/lib/services/admin/messages";
import { searchParamsFromUrl } from "@/lib/services/admin/query";

/** GET /api/messages — paginated contact messages (admin only). Same query params as the admin page. */
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json<ApiResponse<never>>({ success: false, message: "Unauthorized." }, { status: 401 });

  try {
    const sp = searchParamsFromUrl(request.nextUrl);
    const data = await listMessages(parseMessageFilters(sp));
    return NextResponse.json<ApiResponse<typeof data>>({ success: true, data });
  } catch (error) {
    console.error("[api] messages failed", error instanceof Error ? error.message : error);
    return NextResponse.json<ApiResponse<never>>({ success: false, message: "Couldn't load messages right now." }, { status: 500 });
  }
}
