import { cn } from "@/lib/utils/cn";

export const mobileNavItemClass = cn(
  "flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-secondary-dark",
  "transition-colors hover:bg-gold/10 hover:text-gold"
);

export const mobileNavSectionClass =
  "px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-warm-gray";

export const mobileNavSubItemClass = cn(
  "flex w-full items-center rounded-lg py-2 pl-3 text-sm font-medium text-secondary-dark/90",
  "transition-colors hover:bg-gold/10 hover:text-gold"
);
