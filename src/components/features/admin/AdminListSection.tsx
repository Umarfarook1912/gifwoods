"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTable } from "./DataTable";
import { ADMIN_PAGE } from "@/constants/admin-ui";

interface Props<T> {
  title: string;
  subtitle: string;
  columns: Parameters<typeof DataTable<T>>[0]["columns"];
  data: T[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  keyExtractor: (row: T) => string;
  emptyMessage: string;
}

export function AdminListSection<T>({
  title,
  subtitle,
  columns,
  data,
  total,
  page,
  onPageChange,
  keyExtractor,
  emptyMessage,
}: Props<T>) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-bold text-dark">{title}</h2>
        <p className="text-sm text-warm-gray mt-0.5">{subtitle}</p>
      </div>
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={keyExtractor}
        total={total}
        page={page}
        limit={15}
        onPageChange={onPageChange}
        emptyMessage={emptyMessage}
      />
    </section>
  );
}

export function AdminPageHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-2xl font-bold text-dark">{title}</h1>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function AdminSearchInput({ value, onChange, placeholder, className }: SearchProps) {
  return (
    <div className={className ?? ADMIN_PAGE.searchWrap}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 pl-9 bg-white"
      />
    </div>
  );
}
