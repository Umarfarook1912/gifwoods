import { NextResponse } from "next/server";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { getAnalyticsSeries } from "@/lib/admin/dashboard-stats";
import type { DashboardMetricKey } from "@/types/admin-dashboard";

const ALLOWED_DAYS = new Set([7, 14, 30, 90]);
const ALLOWED_METRICS = new Set<DashboardMetricKey>(["revenue", "orders", "users"]);

export async function GET(request: Request) {
  const session = await auth();
  if (!hasApiPermission(session, "dashboard")) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") ?? "7", 10);
  const metric = (searchParams.get("metric") ?? "revenue") as DashboardMetricKey;

  if (!ALLOWED_DAYS.has(days) || !ALLOWED_METRICS.has(metric)) {
    return NextResponse.json({ data: null, error: "Invalid filters" }, { status: 400 });
  }

  try {
    const data = await getAnalyticsSeries(days, metric);
    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load analytics";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
