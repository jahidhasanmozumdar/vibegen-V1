import { NextResponse, type NextRequest } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import type { ApiResponse } from "@/lib/data/types";
import { globalSearch, type SearchResult } from "@/lib/services/admin/search";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json<ApiResponse<never>>({ success: false, message: "Unauthorized." }, { status: 401 });

  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 100);
  try {
    const results = await globalSearch(q);
    return NextResponse.json<ApiResponse<SearchResult[]>>({ success: true, data: results });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, message: "Search is unavailable right now." }, { status: 500 });
  }
}
