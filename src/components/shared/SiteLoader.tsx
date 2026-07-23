"use client";

import { Riple } from "react-loading-indicators";
import { BRAND_GOLD, LOADER_SIZE } from "@/constants/ui";
import { cn } from "@/lib/utils/cn";

interface SiteLoaderProps {
  fullScreen?: boolean;
  className?: string;
}

export function SiteLoader({ fullScreen = true, className }: SiteLoaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen &&
          "fixed inset-0 z-[9999] bg-cream/80 backdrop-blur-sm",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <Riple color={BRAND_GOLD} size={LOADER_SIZE} text="" textColor="" />
    </div>
  );
}
