import type { ChartBarPoint, DashboardMetricKey } from "@/types/admin-dashboard";

const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEKLY_RANGE_THRESHOLD = 14;

export type AnalyticsBucket = {
  revenue: number;
  orders: number;
  users: number;
  label: string;
  fullLabel: string;
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-IN", { weekday: "short" });
}

function formatFullDayLabel(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatWeekLabel(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth();
  const startPart = start.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const endPart = end.toLocaleDateString("en-IN", {
    day: "numeric",
    month: sameMonth ? undefined : "short",
  });
  return `${startPart}–${endPart}`;
}

function formatFullWeekLabel(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return `${start.toLocaleDateString("en-IN", opts)} – ${end.toLocaleDateString("en-IN", opts)}`;
}

export function buildAnalyticsBuckets(days: number) {
  const since = startOfDay(new Date(Date.now() - (days - 1) * DAY_MS));
  const until = startOfDay(new Date());
  const granularity = days > WEEKLY_RANGE_THRESHOLD ? "week" : "day";
  const buckets = new Map<string, AnalyticsBucket>();

  if (granularity === "day") {
    for (let i = 0; i < days; i++) {
      const d = new Date(since.getTime() + i * DAY_MS);
      buckets.set(dayKey(d), {
        revenue: 0,
        orders: 0,
        users: 0,
        label: formatDayLabel(d),
        fullLabel: formatFullDayLabel(d),
      });
    }
  } else {
    let cursor = new Date(since);
    while (cursor <= until) {
      const weekEnd = new Date(Math.min(cursor.getTime() + 6 * DAY_MS, until.getTime()));
      buckets.set(dayKey(cursor), {
        revenue: 0,
        orders: 0,
        users: 0,
        label: formatWeekLabel(cursor, weekEnd),
        fullLabel: formatFullWeekLabel(cursor, weekEnd),
      });
      cursor = new Date(weekEnd.getTime() + DAY_MS);
    }
  }

  return { since, buckets, granularity } as const;
}

export function resolveBucketKey(
  date: Date,
  buckets: Map<string, AnalyticsBucket>,
  granularity: "day" | "week"
): string | null {
  if (granularity === "day") {
    const key = dayKey(date);
    return buckets.has(key) ? key : null;
  }

  const keys = Array.from(buckets.keys());
  const target = dayKey(date);
  let matched: string | null = null;
  for (const key of keys) {
    if (key <= target) matched = key;
    else break;
  }
  return matched;
}

export function bucketsToSeries(
  buckets: Map<string, AnalyticsBucket>,
  metric: DashboardMetricKey
): ChartBarPoint[] {
  return Array.from(buckets.entries()).map(([key, b]) => {
    const revenue = Math.round(b.revenue);
    const value = metric === "orders" ? b.orders : metric === "users" ? b.users : revenue;
    return {
      key,
      label: b.label,
      fullLabel: b.fullLabel,
      value,
      revenue,
      orders: b.orders,
      users: b.users,
    };
  });
}
