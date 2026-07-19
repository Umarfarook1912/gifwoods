"use client";

import { useState, useMemo } from "react";
import { DataTable } from "./DataTable";
import { AdminProductForm } from "./AdminProductForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CONFIRMATIONS } from "@/constants/confirmations";
import { useConfirm } from "@/hooks/useConfirm";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
  const [products, setProducts] = useState(initialProducts);
  const [categoriesState, setCategoriesState] = useState(categories);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "all" && p.category_id !== categoryFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

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
      toast.error(json.error ?? "Failed to delete product");
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
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-dark">Products</h1>
        <Button className="bg-gold text-dark hover:bg-gold-dark font-semibold" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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
          { key: "name", label: "Product", render: (p) => (
            <div>
              <p className="font-medium text-dark text-sm">{p.name}</p>
              <p className="text-xs text-warm-gray">{p.slug}</p>
            </div>
          )},
          { key: "category", label: "Category", render: (p) => (
            <span className="text-sm text-warm-gray">
              {categoriesState.find((c) => c.id === p.category_id)?.name ?? "—"}
            </span>
          )},
          { key: "price", label: "Price", render: (p) => <span className="font-semibold">{formatPrice(p.price)}</span> },
          { key: "stock", label: "Stock", render: (p) => (
            <span className={p.stock < 10 ? "text-red-600 font-semibold" : ""}>{p.stock}</span>
          )},
          { key: "status", label: "Status", render: (p) => (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[p.status]}`}>
              {p.status}
            </span>
          )},
          { key: "is_featured", label: "Featured", render: (p) => (
            p.is_featured ? <Badge className="bg-gold/10 text-gold border-gold/30 text-xs">Featured</Badge> : null
          )},
          { key: "actions", label: "", render: (p) => (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(p.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )},
        ]}
        data={filtered}
        keyExtractor={(p) => p.id}
        total={filtered.length}
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
