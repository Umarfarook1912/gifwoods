"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

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

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  onPageChange,
  className,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = getPageNumbers(currentPage, totalPages);

  // Calculate showing text if totalCount & itemsPerPage are provided
  const hasShowingText = typeof totalCount === "number" && typeof itemsPerPage === "number";
  const from = hasShowingText ? (currentPage - 1) * itemsPerPage! : 0;
  const to = hasShowingText ? Math.min(from + itemsPerPage!, totalCount!) : 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between w-full",
        className
      )}
    >
      {hasShowingText ? (
        <p className="text-sm text-warm-gray">
          Showing <span className="font-medium text-dark">{from + 1}</span>–
          <span className="font-medium text-dark">{to}</span> of{" "}
          <span className="font-medium text-dark">{totalCount}</span> products
        </p>
      ) : (
        <div />
      )}

      <div className="flex flex-wrap items-center gap-2 self-center sm:self-auto">
        {/* Prev page button */}
        {onPageChange ? (
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : currentPage === 1 ? (
          <Button variant="outline" size="sm" disabled className="h-9 w-9 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild className="h-9 w-9 p-0">
            <Link href={createPageURL(currentPage - 1)} aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}

        {/* Page buttons */}
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="inline-flex h-9 w-9 items-center justify-center text-sm text-warm-gray"
              >
                ...
              </span>
            );
          }

          const isCurrent = currentPage === page;

          if (onPageChange) {
            return (
              <Button
                key={page}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "h-9 w-9 p-0 text-sm font-semibold transition-all",
                  isCurrent
                    ? "bg-dark text-white hover:bg-dark cursor-default"
                    : "border-border text-warm-gray hover:bg-cream/40"
                )}
              >
                {page}
              </Button>
            );
          }

          return (
            <Button
              key={page}
              variant={isCurrent ? "default" : "outline"}
              size="sm"
              asChild={!isCurrent}
              disabled={isCurrent}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "h-9 w-9 p-0 text-sm font-semibold transition-all",
                isCurrent
                  ? "bg-dark text-white hover:bg-dark cursor-default disabled:opacity-100"
                  : "border-border text-warm-gray hover:bg-cream/40"
              )}
            >
              {isCurrent ? (
                <span>{page}</span>
              ) : (
                <Link href={createPageURL(page)}>{page}</Link>
              )}
            </Button>
          );
        })}

        {/* Next page button */}
        {onPageChange ? (
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : currentPage === totalPages ? (
          <Button variant="outline" size="sm" disabled className="h-9 w-9 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild className="h-9 w-9 p-0">
            <Link href={createPageURL(currentPage + 1)} aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
