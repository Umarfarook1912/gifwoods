export const ADMIN_TABLE = {
  head: "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-warm-gray whitespace-nowrap",
  cell: "px-4 py-3.5 align-middle text-sm",
  actions: "w-[1%] whitespace-nowrap text-right",
  compact: "w-[1%] whitespace-nowrap",
  userCell: "min-w-0 max-w-[260px]",
} as const;

export const ADMIN_PAGE = {
  shell: "p-6 md:p-8 space-y-6",
  filters: "flex flex-wrap items-center gap-3",
  searchWrap: "relative flex-1 min-w-[200px] max-w-md",
  subtitle: "text-sm text-warm-gray -mt-2",
} as const;
