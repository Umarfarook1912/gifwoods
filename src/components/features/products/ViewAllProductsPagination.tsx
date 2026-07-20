import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatHomeProductsShowing } from "@/lib/utils/formatters";
import { HOME_VIEW_ALL_PRODUCTS_LABEL } from "@/constants/ui";

interface ViewAllProductsPaginationProps {
  href: string;
  totalCount: number;
  mobileShown: number;
  desktopShown: number;
  className?: string;
}

export function ViewAllProductsPagination({
  href,
  totalCount,
  mobileShown,
  desktopShown,
  className,
}: ViewAllProductsPaginationProps) {
  return (
    <div
      className={cn(
        "mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-warm-gray">
        <span className="lg:hidden">
          {formatHomeProductsShowing(1, mobileShown, totalCount)}
        </span>
        <span className="hidden lg:inline">
          {formatHomeProductsShowing(1, desktopShown, totalCount)}
        </span>
      </p>

      <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            aria-label="Previous page"
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled
            aria-current="page"
            className="h-9 min-w-9 px-3 bg-dark text-white hover:bg-dark"
          >
            1
          </Button>
          <Button variant="outline" size="sm" asChild className="h-9 w-9 p-0">
            <Link href={href} aria-label={HOME_VIEW_ALL_PRODUCTS_LABEL}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Link
          href={href}
          className="text-sm font-medium text-gold transition-colors hover:text-gold-dark"
        >
          {HOME_VIEW_ALL_PRODUCTS_LABEL}
        </Link>
      </div>
    </div>
  );
}
