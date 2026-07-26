"use client";

import { cn } from "@/lib/utils/cn";
import type { StatusBarPoint } from "@/types/admin-dashboard";

interface Props {
  title: string;
  subtitle: string;
  data: StatusBarPoint[];
  emptyLabel: string;
}

export function DashboardStatusChart({ title, subtitle, data, emptyLabel }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-2xl border border-border bg-white p-5 md:p-6 shadow-sm h-full">
      <div className="mb-6">
        <h2 className="font-display text-lg font-bold text-dark">{title}</h2>
        <p className="text-sm text-warm-gray mt-0.5">{subtitle}</p>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-warm-gray py-12 text-center">{emptyLabel}</p>
      ) : (
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.label} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-dark">{item.label}</span>
                <span className="text-sm font-semibold tabular-nums text-dark">{item.value}</span>
              </div>
              <div className="h-2.5 rounded-full bg-cream overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all group-hover:brightness-110",
                    item.colorClass
                  )}
                  style={{ width: `${Math.max((item.value / max) * 100, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
