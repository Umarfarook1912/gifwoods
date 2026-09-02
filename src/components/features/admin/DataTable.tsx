"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ADMIN_TABLE } from "@/constants/admin-ui";

function getPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const siblings = 1;
  const leftSiblingIndex = Math.max(currentPage - siblings, 1);
  const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 3;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 5;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 5;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i
    );
    return [1, "...", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, "...", ...middleRange, "...", totalPages];
}

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  keyExtractor: (row: T) => string;
}

function isActionColumn<T>(col: Column<T>): boolean {
  return col.key === "actions" || col.label === "Actions" || col.label === "";
}

function columnClass<T>(col: Column<T>, type: "head" | "cell"): string {
  const isActions = isActionColumn(col);
  return cn(
    type === "head" ? ADMIN_TABLE.head : ADMIN_TABLE.cell,
    isActions && ADMIN_TABLE.actions,
    col.className
  );
}

export function DataTable<T>({
  columns,
  data,
  loading,
  total = 0,
  page = 1,
  limit = 20,
  onPageChange,
  emptyMessage = "No records found",
  keyExtractor,
}: Props<T>) {
  const totalPages = Math.ceil(total / limit);
  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full min-w-[640px] table-auto border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-cream/60">
              {columns.map((col) => (
                <th key={String(col.key)} className={columnClass(col, "head")}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i} className="border-b border-border/60">
                  {columns.map((col) => (
                    <td key={String(col.key)} className={columnClass(col, "cell")}>
                      <Skeleton className="h-4 w-full max-w-[12rem]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-14 text-center text-sm text-warm-gray"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    "border-b border-border/60 transition-colors hover:bg-cream/40",
                    rowIndex % 2 === 1 && "bg-cream/20"
                  )}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className={columnClass(col, "cell")}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[String(col.key)] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-border pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-warm-gray text-center sm:text-left">
            Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of{" "}
            {total}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pages.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`dots-${idx}`}
                    className="inline-flex h-8 w-8 items-center justify-center text-xs text-warm-gray"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = page === p;
              return (
                <Button
                  key={p}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange?.(p as number)}
                  disabled={isCurrent}
                  className={cn(
                    "h-8 w-8 p-0 text-xs font-semibold",
                    isCurrent
                      ? "bg-dark text-white hover:bg-dark disabled:opacity-100"
                      : "border-border text-warm-gray hover:bg-cream"
                  )}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
