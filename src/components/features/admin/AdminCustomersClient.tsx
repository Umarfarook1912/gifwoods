"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "./DataTable";
import { AdminPageHeader, AdminSearchInput } from "./AdminListSection";
import { buildCustomerColumns } from "./admin-user-table-columns";
import { ADMIN_USERS_COPY } from "@/constants/admin-users";
import { ADMIN_PAGE } from "@/constants/admin-ui";
import { useConfirm } from "@/hooks/useConfirm";
import { useSession } from "next-auth/react";
import { APP_ERRORS } from "@/constants/errors";
import { toastError } from "@/lib/errors/toast";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import type { UserProfile } from "@/types/user";

interface Props {
  initialCustomers: UserProfile[];
}

function paginate<T>(items: T[], page: number, limit = 15): T[] {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

export function AdminCustomersClient({ initialCustomers }: Props) {
  const confirm = useConfirm();
  const router = useRouter();
  const { data: session } = useSession();
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const isSuperAdmin = session?.user?.role === "super_admin";

  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const handleDeleteUser = async (user: UserProfile) => {
    if (
      !(await confirm({
        title: "Delete Account",
        description: `Permanently delete ${user.name || user.email}? This cannot be undone.`,
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        variant: "destructive",
      }))
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (res.ok) {
        setCustomers((prev) => prev.filter((u) => u.id !== user.id));
        toast.success("User deleted.");
      } else {
        const data = await res.json();
        toastError(data.error, APP_ERRORS.USER_DELETE_FAILED);
      }
    } catch (err) {
      toastError(err, APP_ERRORS.GENERIC);
    }
  };

  const columns = buildCustomerColumns({
    isSuperAdmin,
    router,
    onDelete: handleDeleteUser,
  });

  return (
    <div className={ADMIN_PAGE.shell}>
      <AdminPageHeader title={ADMIN_USERS_COPY.CUSTOMERS_TITLE}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </AdminPageHeader>

      <p className={ADMIN_PAGE.subtitle}>{ADMIN_USERS_COPY.CUSTOMERS_SUBTITLE}</p>

      <AdminSearchInput
        value={search}
        onChange={setSearch}
        placeholder={ADMIN_USERS_COPY.SEARCH_PLACEHOLDER}
      />

      <DataTable
        columns={columns}
        data={paginate(filtered, page)}
        keyExtractor={(u) => u.id}
        total={filtered.length}
        page={page}
        limit={15}
        onPageChange={setPage}
        emptyMessage={ADMIN_USERS_COPY.NO_CUSTOMERS}
      />
    </div>
  );
}
