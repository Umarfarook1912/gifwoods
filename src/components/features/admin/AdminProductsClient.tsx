"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "./DataTable";
import { AdminProductForm } from "./AdminProductForm";
import { AdminPageHeader, AdminSearchInput } from "./AdminListSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils/formatters";
import { API_ENDPOINTS } from "@/constants/api";
import { ADMIN_TABLE_COPY } from "@/constants/admin-users";
import { ADMIN_PAGE, ADMIN_TABLE } from "@/constants/admin-ui";
import { CONFIRMATIONS } from "@/constants/confirmations";
import { useConfirm } from "@/hooks/useConfirm";
import { APP_ERRORS } from "@/constants/errors";
import { toastError } from "@/lib/errors/toast";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import type { Product, Category, ProductStatus } from "@/types/product";

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

const STATUS_COLORS: Record<ProductStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-700",
};

export function AdminProductsClient({ initialProducts, categories }: Props) {
  const confirm = useConfirm();
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [categoriesState, setCategoriesState] = useState(categories);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { setProducts(initialProducts); }, [initialProducts]);
  useEffect(() => { setCategoriesState(categories); }, [categories]);
  
  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "all" && p.category_id !== categoryFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const paginated = useMemo(() => {
    const limit = 15;
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setDialogOpen(true);
  };

  const handleSaved = (product: Product, newCategory: Category | null) => {
    if (newCategory) {
      setCategoriesState((prev) =>
        prev.some((c) => c.id === newCategory.id) ? prev : [...prev, newCategory]
      );
    }
    setProducts((prev) =>
      editing ? prev.map((p) => (p.id === editing.id ? product : p)) : [product, ...prev]
    );
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm(CONFIRMATIONS.PRODUCT_DELETE))) return;
    const res = await fetch(API_ENDPOINTS.PRODUCT(id), { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || json.error) {
      toastError(json.error, APP_ERRORS.PRODUCT_DELETE_FAILED);
      return;
    }
    if (json.data.action === "deleted") {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted permanently");
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "archived" } : p))
      );
      toast.success("Product archived (it has past orders)");
    }
  };

  return (
    <div className={ADMIN_PAGE.shell}>
      <AdminPageHeader title="Products">
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button className="bg-gold text-dark hover:bg-gold-dark font-semibold" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </AdminPageHeader>

      <div className={ADMIN_PAGE.filters}>
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
        />
        <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoriesState.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            label: ADMIN_TABLE_COPY.PRODUCT,
            className: ADMIN_TABLE.userCell,
            render: (p) => (
              <div className="min-w-0">
                <p className="font-medium text-dark line-clamp-2">{p.name}</p>
                <p className="text-xs text-warm-gray truncate">{p.slug}</p>
              </div>
            ),
          },
          {
            key: "category",
            label: ADMIN_TABLE_COPY.CATEGORY,
            className: "max-w-[140px] whitespace-normal",
            render: (p) => (
              <span className="text-sm text-warm-gray line-clamp-2">
                {categoriesState.find((c) => c.id === p.category_id)?.name ?? "—"}
              </span>
            ),
          },
          {
            key: "price",
            label: ADMIN_TABLE_COPY.PRICE,
            className: "whitespace-nowrap font-semibold",
            render: (p) => formatPrice(p.price),
          },
          {
            key: "stock",
            label: ADMIN_TABLE_COPY.STOCK,
            className: "whitespace-nowrap text-center",
            render: (p) => (
              <span className={p.stock < 10 ? "text-red-600 font-semibold" : ""}>{p.stock}</span>
            ),
          },
          {
            key: "status",
            label: ADMIN_TABLE_COPY.STATUS,
            className: "whitespace-nowrap",
            render: (p) => (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[p.status]}`}>
                {p.status}
              </span>
            ),
          },
          {
            key: "is_bestseller",
            label: ADMIN_TABLE_COPY.HOME,
            className: "whitespace-nowrap",
            render: (p) => (
              <div className="flex flex-wrap gap-1">
                {p.is_bestseller ? (
                  <Badge className="bg-gold/10 text-gold border-gold/30 text-xs">Bestseller</Badge>
                ) : null}
                {p.is_new_arrival ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">New</Badge>
                ) : null}
              </div>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (p) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          },
        ]}
        data={paginated}
        keyExtractor={(p) => p.id}
        total={filtered.length}
        page={page}
        limit={15}
        onPageChange={setPage}
        emptyMessage="No products found"
      />

      <AdminProductForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        categories={categoriesState}
        onSaved={handleSaved}
      />
    </div>
  );
}
