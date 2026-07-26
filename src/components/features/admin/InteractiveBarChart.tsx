"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import type { ChartBarPoint, DashboardMetricKey } from "@/types/admin-dashboard";

interface Props {
  title: string;
  subtitle: string;
  data: ChartBarPoint[];
  metric: DashboardMetricKey;
  emptyLabel: string;
  accentClass?: string;
  badge?: string;
}

function formatMetric(metric: DashboardMetricKey, value: number) {
  if (metric === "revenue") return formatPrice(value);
  return String(value);
}

export function InteractiveBarChart({
  title,
  subtitle,
  data,
  metric,
  emptyLabel,
  accentClass = "bg-gradient-to-t from-gold-dark to-gold",
  badge,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const hasData = data.some((d) => d.value > 0 || d.orders > 0 || d.users > 0);
  const active = data.find((d) => d.key === hovered) ?? null;
  const compact = data.length > 10;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 md:p-6 shadow-sm h-full">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-dark">{title}</h2>
          <p className="text-sm text-warm-gray mt-0.5">{subtitle}</p>
        </div>
        {badge ? (
          <span className="shrink-0 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold-dark">
            {badge}
          </span>
        ) : null}
      </div>

      {!hasData ? (
        <p className="text-sm text-warm-gray py-16 text-center">{emptyLabel}</p>
      ) : (
        <div className="relative">
          {active && (
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-xl border border-border bg-dark px-3 py-2 text-white shadow-lg pointer-events-none">
              <p className="text-xs font-semibold whitespace-nowrap">{active.fullLabel}</p>
              <p className="text-sm font-bold text-gold mt-1 whitespace-nowrap">
                {formatMetric(metric, active.value)}
              </p>
              <p className="text-[11px] text-white/75 mt-0.5 whitespace-nowrap">
                Revenue {formatPrice(active.revenue)} · Orders {active.orders} · Users {active.users}
              </p>
            </div>
          )}

          <div className="flex items-end gap-2 sm:gap-3 h-52 pt-14">
            {data.map((point) => {
              const heightPct = Math.max((point.value / max) * 100, point.value > 0 ? 12 : 4);
              const isActive = hovered === point.key;
              return (
                <div
                  key={point.key}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end min-w-0"
                  onMouseEnter={() => setHovered(point.key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="relative w-full flex-1 flex items-end justify-center">
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all duration-200 cursor-pointer",
                        compact ? "max-w-14" : "max-w-12",
                        point.value > 0 ? accentClass : "bg-border/50",
                        isActive && "brightness-110 shadow-md ring-2 ring-gold/40"
                      )}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <p
                    className={cn(
                      "font-medium text-center leading-tight w-full",
                      compact ? "text-[10px] text-warm-gray" : "text-[11px] text-dark",
                      isActive && "text-dark font-semibold"
                    )}
                  >
                    {point.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
