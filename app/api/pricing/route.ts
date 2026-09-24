import { NextResponse } from "next/server";

import type { ApiResponse, PricingPlan } from "@/lib/data/types";
import { getPricingPlans } from "@/lib/services/content";

export const revalidate = 300;

/** Active pricing plans (public). */
export async function GET() {
  try {
    const data = await getPricingPlans();
    return NextResponse.json<ApiResponse<PricingPlan[]>>({ success: true, data });
  } catch {
    return NextResponse.json<ApiResponse<never>>({ success: false, message: "Pricing is unavailable right now." }, { status: 500 });
  }
}
