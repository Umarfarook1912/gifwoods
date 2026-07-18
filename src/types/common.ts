export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  error: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
}

export type SortOrder = "asc" | "desc";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface SelectOption {
  label: string;
  value: string;
}
