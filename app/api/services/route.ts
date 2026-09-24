import { NextResponse } from "next/server";

import type { ApiResponse, Service } from "@/lib/data/types";
import { getServices } from "@/lib/services/content";

export const revalidate = 300;

/** Published services (public). */
export async function GET() {
  try {
    const data = await getServices();
    return NextResponse.json<ApiResponse<Service[]>>({ success: true, data });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, message: "Services are unavailable right now." }, { status: 500 });
  }
}
