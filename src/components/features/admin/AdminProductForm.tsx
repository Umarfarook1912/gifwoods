"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductFormFields } from "./ProductFormFields";
import { ImageListField, SpecificationListField } from "./ProductFormLists";
import { API_ENDPOINTS } from "@/constants/api";
import { NEW_CATEGORY_OPTION } from "@/constants/ui";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import type { Category, Product, ProductFormState } from "@/types/product";

const EMPTY_FORM: ProductFormState = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  original_price: 0,
  category_id: "",
  images: [""],
  tags: [],
  stock: 0,
  is_featured: false,
  badge: "",
  status: "active",
  specifications: [],
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Product | null;
  categories: Category[];
  onSaved: (product: Product, newCategory: Category | null) => void;
}

export function AdminProductForm({ open, onOpenChange, editing, categories, onSaved }: Props) {
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [saving, setSaving] = useState(false);

  const isNewCategory = form.category_id === NEW_CATEGORY_OPTION;

  useEffect(() => {
    if (!open) return;
    setNewCategoryName("");
    setForm(
      editing
        ? {
            name: editing.name,
            slug: editing.slug,
            description: editing.description,
            price: editing.price,
            original_price: editing.original_price ?? 0,
            category_id: editing.category_id ?? "",
            images: editing.images.length > 0 ? editing.images : [""],
            tags: editing.tags,
            stock: editing.stock,
            is_featured: editing.is_featured,
            badge: editing.badge ?? "",
            status: editing.status,
            specifications: editing.specifications ?? [],
          }
        : EMPTY_FORM
    );
  }, [open, editing]);

  const handleSave = async () => {
    if (isNewCategory && !newCategoryName.trim()) {
      toast.error("Please enter the new category name");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        category_id: isNewCategory ? undefined : form.category_id || undefined,
        new_category_name: isNewCategory ? newCategoryName.trim() : undefined,
        original_price: form.original_price || undefined,
        badge: form.badge || undefined,
        images: form.images.filter(Boolean),
        specifications: form.specifications.filter((s) => s.key.trim() && s.value.trim()),
      };
      const url = editing ? API_ENDPOINTS.PRODUCT(editing.id) : API_ENDPOINTS.PRODUCTS;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Save failed");

      toast.success(editing ? "Product updated!" : "Product created!");
      onSaved(json.data, json.newCategory ?? null);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {editing ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2">
          <ProductFormFields
            form={form}
            setForm={setForm}
            categories={categories}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
          />

          <ImageListField
            images={form.images}
            onChange={(images) => setForm({ ...form, images })}
          />
          <SpecificationListField
            specifications={form.specifications}
            onChange={(specifications) => setForm({ ...form, specifications })}
          />

          <div className="md:col-span-2 flex items-center gap-3">
            <Switch
              checked={form.is_featured}
              onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
            />
            <Label>Featured product</Label>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gold text-dark hover:bg-gold-dark font-semibold"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            {saving ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
