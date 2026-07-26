"use client";

import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InteractiveBarChart } from "./InteractiveBarChart";
import { DashboardStatusChart } from "./DashboardStatusChart";
import { API_ENDPOINTS } from "@/constants/api";
import {
  DASHBOARD_COPY,
  DASHBOARD_METRICS,
  DASHBOARD_RANGES,
} from "@/constants/ui";
import { formatPrice } from "@/lib/utils/formatters";
import type {
  AnalyticsSeriesResponse,
  DashboardMetricKey,
  DashboardRangeKey,
} from "@/types/admin-dashboard";

interface Props {
  initialData: AnalyticsSeriesResponse;
}

export function AdminAnalyticsPanel({ initialData }: Props) {
  const [range, setRange] = useState<DashboardRangeKey>(
    String(initialData.rangeDays) as DashboardRangeKey
  );
  const [metric, setMetric] = useState<DashboardMetricKey>(initialData.metric);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipFirstFetch = useRef(true);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }

    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_ENDPOINTS.ADMIN_ANALYTICS}?days=${range}&metric=${metric}`;
        const res = await fetch(url, { signal: controller.signal });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error ?? "Failed to load analytics");
        setData(json.data as AnalyticsSeriesResponse);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [range, metric]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex-1 min-w-40">
          <p className="text-xs font-medium text-warm-gray mb-1.5">{DASHBOARD_COPY.RANGE_LABEL}</p>
          <Select value={range} onValueChange={(v) => v && setRange(v as DashboardRangeKey)}>
            <SelectTrigger className="w-full bg-cream/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DASHBOARD_RANGES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-40">
          <p className="text-xs font-medium text-warm-gray mb-1.5">{DASHBOARD_COPY.METRIC_LABEL}</p>
          <Select value={metric} onValueChange={(v) => v && setMetric(v as DashboardMetricKey)}>
            <SelectTrigger className="w-full bg-cream/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DASHBOARD_METRICS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 flex-[1.4]">
          {[
            { label: DASHBOARD_COPY.SUMMARY_REVENUE, value: formatPrice(data.summary.revenue) },
            { label: DASHBOARD_COPY.SUMMARY_ORDERS, value: data.summary.orders },
            { label: DASHBOARD_COPY.SUMMARY_USERS, value: data.summary.users },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-cream/50 border border-border px-3 py-2">
              <p className="text-[10px] text-warm-gray leading-tight">{item.label}</p>
              <p className="text-sm font-bold text-dark tabular-nums mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && (
        <p className="text-xs text-warm-gray animate-pulse">{DASHBOARD_COPY.LOADING}</p>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 ${loading ? "opacity-70" : ""}`}>
        <div className="lg:col-span-3">
          <InteractiveBarChart
            title={DASHBOARD_COPY.MAIN_TITLE}
            subtitle={
              data.granularity === "week"
                ? DASHBOARD_COPY.MAIN_SUBTITLE_WEEK
                : DASHBOARD_COPY.MAIN_SUBTITLE_DAY
            }
            data={data.series}
            metric={metric}
            emptyLabel={DASHBOARD_COPY.EMPTY_CHART}
            badge={
              data.granularity === "week"
                ? DASHBOARD_COPY.GRANULARITY_WEEK
                : DASHBOARD_COPY.GRANULARITY_DAY
            }
          />
        </div>
        <div className="lg:col-span-2">
          <DashboardStatusChart
            title={DASHBOARD_COPY.STATUS_TITLE}
            subtitle={DASHBOARD_COPY.STATUS_SUBTITLE}
            data={data.ordersByStatus}
            emptyLabel={DASHBOARD_COPY.EMPTY_STATUS}
          />
        </div>
      </div>

      <div className={loading ? "opacity-70" : ""}>
        <InteractiveBarChart
          title={DASHBOARD_COPY.USERS_TITLE}
          subtitle={
            data.granularity === "week"
              ? DASHBOARD_COPY.USERS_SUBTITLE_WEEK
              : DASHBOARD_COPY.USERS_SUBTITLE_DAY
          }
          data={data.usersSeries}
          metric="users"
          emptyLabel={DASHBOARD_COPY.EMPTY_CHART}
          accentClass="bg-gradient-to-t from-secondary-dark to-secondary-dark/70"
          badge={
            data.granularity === "week"
              ? DASHBOARD_COPY.GRANULARITY_WEEK
              : DASHBOARD_COPY.GRANULARITY_DAY
          }
        />
      </div>
    </div>
  );
}
