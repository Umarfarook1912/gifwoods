"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "./DataTable";
import { RichTextEditor } from "./RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filtered = useMemo(
    () =>
      categories.filter(
        (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [categories, search]
  );

  const paginated = useMemo(() => {
    const limit = 15;
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page]);

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
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed to add category");
      setCategories((prev) =>
        [...prev, { ...json.data, product_count: 0 }].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      setNewName("");
      setNewDescription("");
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
      const res = await fetch(API_ENDPOINTS.CATEGORY(category.id), {
        method: "DELETE",
      });
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-dark">Categories</h1>
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
      </div>

      <div className="mb-6 space-y-3 rounded-xl border border-border bg-cream/40 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              placeholder="New category name (e.g. Valentine Gifting)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="mt-1 bg-white"
            />
          </div>
          <Button
            className="bg-gold font-semibold text-dark hover:bg-gold-dark"
            onClick={handleAdd}
            disabled={adding}
          >
            {adding ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add Category
          </Button>
        </div>
        <div>
          <Label>Description</Label>
          <RichTextEditor
            value={newDescription}
            onChange={setNewDescription}
            placeholder="Optional category description shown on the category page…"
          />
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            label: "Category",
            render: (c) => (
              <div>
                <p className="text-sm font-medium text-dark">{c.name}</p>
                <p className="text-xs text-warm-gray">{c.slug}</p>
              </div>
            ),
          },
          {
            key: "product_count",
            label: "Products",
            render: (c) =>
              c.product_count > 0 ? (
                <Badge className="border-gold/30 bg-gold/10 text-xs text-gold">
                  {c.product_count} product{c.product_count > 1 ? "s" : ""}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">No products</span>
              ),
          },
          {
            key: "actions",
            label: "",
            render: (c) => (
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
            ),
          },
        ]}
        data={paginated}
        keyExtractor={(c) => c.id}
        total={filtered.length}
        page={page}
        limit={15}
        onPageChange={setPage}
        emptyMessage="No categories found"
      />
    </div>
  );
}
