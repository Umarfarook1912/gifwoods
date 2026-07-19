"use client";

import { useState, useMemo } from "react";
import { DataTable } from "./DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { API_ENDPOINTS } from "@/constants/api";
import { categoryDeleteConfirmation } from "@/constants/confirmations";
import { useConfirm } from "@/hooks/useConfirm";
import { toast } from "sonner";
import { Plus, Trash2, Search, RefreshCw } from "lucide-react";
import type { Category } from "@/types/product";

type CategoryRow = Category & { product_count: number };

interface Props {
  initialCategories: CategoryRow[];
}

export function AdminCategoriesClient({ initialCategories }: Props) {
  const confirm = useConfirm();
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      categories.filter(
        (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [categories, search]
  );

  const handleAdd = async () => {
    if (newName.trim().length < 2) {
      toast.error("Category name must be at least 2 characters");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(API_ENDPOINTS.CATEGORIES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed to add category");
      setCategories((prev) =>
        [...prev, { ...json.data, product_count: 0 }].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      setNewName("");
      toast.success(`Category "${json.data.name}" added`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add category");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (category: CategoryRow) => {
    if (!(await confirm(categoryDeleteConfirmation(category.name)))) return;
    setDeletingId(category.id);
    try {
      const res = await fetch(API_ENDPOINTS.CATEGORY(category.id), { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed to delete category");
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      toast.success(`Category "${category.name}" removed`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-dark">Categories</h1>
      </div>

      {/* Add new category */}
      <div className="flex gap-3 mb-6 flex-wrap items-center rounded-xl border border-border bg-cream/40 p-4">
        <Input
          placeholder="New category name (e.g. Valentine Gifting)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 min-w-56 bg-white"
        />
        <Button
          className="bg-gold text-dark hover:bg-gold-dark font-semibold"
          onClick={handleAdd}
          disabled={adding}
        >
          {adding ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add Category
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Category", render: (c) => (
            <div>
              <p className="font-medium text-dark text-sm">{c.name}</p>
              <p className="text-xs text-warm-gray">{c.slug}</p>
            </div>
          )},
          { key: "product_count", label: "Products", render: (c) => (
            c.product_count > 0 ? (
              <Badge className="bg-gold/10 text-gold border-gold/30 text-xs">
                {c.product_count} product{c.product_count > 1 ? "s" : ""}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">No products</span>
            )
          )},
          { key: "actions", label: "", render: (c) => (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-destructive"
              onClick={() => handleDelete(c)}
              disabled={deletingId === c.id}
              title={
                c.product_count > 0
                  ? "Categories with products cannot be deleted"
                  : "Delete category"
              }
            >
              {deletingId === c.id ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          )},
        ]}
        data={filtered}
        keyExtractor={(c) => c.id}
        total={filtered.length}
        emptyMessage="No categories found"
      />
    </div>
  );
}
