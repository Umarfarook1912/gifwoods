"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/utils/formatters";
import { NEW_CATEGORY_OPTION, PRODUCT_BADGES, PRODUCT_STATUSES } from "@/constants/ui";
import type { Category, ProductFormState, ProductStatus } from "@/types/product";

interface Props {
  form: ProductFormState;
  setForm: (form: ProductFormState) => void;
  categories: Category[];
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
}

export function ProductFormFields({
  form,
  setForm,
  categories,
  newCategoryName,
  setNewCategoryName,
}: Props) {
  const isNewCategory = form.category_id === NEW_CATEGORY_OPTION;

  return (
    <>
      <div>
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })
          }
          className="mt-1"
          placeholder="Engraved Walnut Photo Frame"
        />
      </div>
      <div>
        <Label>Slug</Label>
        <Input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Category</Label>
        <Select
          value={form.category_id || undefined}
          onValueChange={(v) => v && setForm({ ...form, category_id: v })}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select category">
              {(value) => {
                if (!value) return null;
                if (value === NEW_CATEGORY_OPTION) return "+ Add new category…";
                return categories.find((c) => c.id === value)?.name ?? "Select category";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
            <SelectItem value={NEW_CATEGORY_OPTION}>+ Add new category…</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isNewCategory ? (
        <div>
          <Label>New Category Name</Label>
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="mt-1"
            placeholder="e.g. Valentine Gifting"
          />
        </div>
      ) : (
        <div>
          <Label>Badge</Label>
          <Select
            value={form.badge || "none"}
            onValueChange={(v) => setForm({ ...form, badge: !v || v === "none" ? "" : v })}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="None">
                {(value) => {
                  if (!value || value === "none") return "None";
                  return String(value);
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {PRODUCT_BADGES.map((badge) => (
                <SelectItem key={badge} value={badge}>
                  {badge}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label>Price (₹)</Label>
          <Input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Original Price (₹)</Label>
          <Input
            type="number"
            value={form.original_price}
            onChange={(e) =>
              setForm({ ...form, original_price: parseFloat(e.target.value) || 0 })
            }
            className="mt-1"
          />
        </div>
        <div>
          <Label>Stock</Label>
          <Input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => v && setForm({ ...form, status: v as ProductStatus })}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_STATUSES.map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="md:col-span-2">
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-1"
          rows={3}
        />
      </div>
      <div className="md:col-span-2">
        <Label>Tags (comma separated)</Label>
        <Input
          value={form.tags.join(", ")}
          onChange={(e) =>
            setForm({
              ...form,
              tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
            })
          }
          className="mt-1"
          placeholder="wood, personalized, luxury"
        />
      </div>
    </>
  );
}
