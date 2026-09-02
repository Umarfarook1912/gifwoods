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
import { NEW_CATEGORY_OPTION, PRODUCT_HOME_TOGGLE_LABELS } from "@/constants/ui";
import { CUSTOMIZATION_COPY } from "@/constants/customization";
import { APP_ERRORS } from "@/constants/errors";
import { toastError } from "@/lib/errors/toast";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import type { Category, Product, ProductFormState } from "@/types/product";

const EMPTY_FORM: ProductFormState = {
  name: "",
  slug: "",
  code: "",
  description: "",
  price: 0,
  original_price: 0,
  category_id: "",
  images: [""],
  tags: [],
  stock: 0,
  is_bestseller: false,
  is_new_arrival: false,
  customization_text: false,
  customization_image: false,
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
            code: editing.code ?? "",
            description: editing.description,
            price: editing.price,
            original_price: editing.original_price ?? 0,
            category_id: editing.category_id ?? "",
            images: editing.images.length > 0 ? editing.images : [""],
            tags: editing.tags,
            stock: editing.stock,
            is_bestseller: editing.is_bestseller ?? false,
            is_new_arrival: editing.is_new_arrival ?? false,
            customization_text: editing.customization_text ?? false,
            customization_image: editing.customization_image ?? false,
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
        code: form.code.trim() || undefined,
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
      toastError(e, APP_ERRORS.PRODUCT_SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl max-h-[90vh]">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4 pr-12">
          <DialogTitle className="font-display text-xl">
            {editing ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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

            <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_bestseller}
                  onCheckedChange={(v) => setForm({ ...form, is_bestseller: v })}
                />
                <Label>{PRODUCT_HOME_TOGGLE_LABELS.BESTSELLER}</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_new_arrival}
                  onCheckedChange={(v) => setForm({ ...form, is_new_arrival: v })}
                />
                <Label>{PRODUCT_HOME_TOGGLE_LABELS.NEW_ARRIVAL}</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.customization_text}
                  onCheckedChange={(v) => setForm({ ...form, customization_text: v })}
                />
                <Label>{CUSTOMIZATION_COPY.TEXT_TOGGLE}</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.customization_image}
                  onCheckedChange={(v) => setForm({ ...form, customization_image: v })}
                />
                <Label>{CUSTOMIZATION_COPY.IMAGE_TOGGLE}</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex gap-3 border-t border-border bg-cream/40 px-6 py-4">
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
