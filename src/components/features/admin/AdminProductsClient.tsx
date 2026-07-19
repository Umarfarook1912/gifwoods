"use client";

import { useState, useMemo } from "react";
import { DataTable } from "./DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils/formatters";
import { API_ENDPOINTS } from "@/constants/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, RefreshCw } from "lucide-react";
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

const HARDCODED_CATEGORIES = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Housewarming",
  "Baby Shower",
  "Corporate Gifting",
  "New Arrivals",
  "Best Sellers / Trending"
];

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  original_price: 0,
  category_id: "",
  images: [""],
  tags: [] as string[],
  stock: 0,
  is_featured: false,
  badge: "",
  status: "active" as ProductStatus,
  specifications: [] as Array<{ key: string; value: string }>,
};

export function AdminProductsClient({ initialProducts, categories }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [categoriesState, setCategoriesState] = useState(categories);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const dropdownCategories = useMemo(() => {
    const list = [...HARDCODED_CATEGORIES];
    categoriesState.forEach((dbCat) => {
      const isDuplicate = list.some(
        (h) => h.toLowerCase() === dbCat.name.toLowerCase() || 
               h.toLowerCase() === dbCat.name.replace(/s$/, "").toLowerCase() ||
               dbCat.name.toLowerCase() === h.replace(/s$/, "").toLowerCase()
      );
      if (!isDuplicate) {
        list.push(dbCat.name);
      }
    });
    return list;
  }, [categoriesState]);

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
    setForm({ ...EMPTY_FORM, specifications: [] });
    setSelectedCategoryName("");
    setNewCategoryName("");
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    const currentCat = categoriesState.find((c) => c.id === product.category_id);
    if (currentCat) {
      setSelectedCategoryName(currentCat.name);
    } else {
      setSelectedCategoryName("");
    }
    setNewCategoryName("");
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      original_price: product.original_price ?? 0,
      category_id: product.category_id,
      images: product.images.length > 0 ? product.images : [""],
      tags: product.tags,
      stock: product.stock,
      is_featured: product.is_featured,
      badge: product.badge ?? "",
      status: product.status,
      specifications: product.specifications || [],
    });
    setDialogOpen(true);
  };

  const handleAddSpecification = () => {
    setForm((prev) => ({
      ...prev,
      specifications: [...(prev.specifications || []), { key: "", value: "" }],
    }));
  };

  const handleUpdateSpecification = (index: number, field: "key" | "value", val: string) => {
    setForm((prev) => {
      const specs = [...(prev.specifications || [])];
      specs[index] = { ...specs[index], [field]: val };
      return { ...prev, specifications: specs };
    });
  };

  const handleRemoveSpecification = (index: number) => {
    setForm((prev) => ({
      ...prev,
      specifications: (prev.specifications || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let categoryIdToSend = form.category_id;
      let newCategoryNameToSend = undefined;

      if (selectedCategoryName === "other") {
        if (!newCategoryName.trim()) {
          throw new Error("Please enter a new category name");
        }
        newCategoryNameToSend = newCategoryName.trim();
        categoryIdToSend = "";
      } else {
        const match = categoriesState.find((c) => c.name.toLowerCase() === selectedCategoryName.toLowerCase());
        if (match) {
          categoryIdToSend = match.id;
        } else if (selectedCategoryName) {
          newCategoryNameToSend = selectedCategoryName;
          categoryIdToSend = "";
        }
      }

      const payload = {
        ...form,
        category_id: categoryIdToSend || undefined,
        new_category_name: newCategoryNameToSend,
        original_price: form.original_price || undefined,
        badge: form.badge || undefined,
        images: form.images.filter(Boolean),
        specifications: (form.specifications || []).filter((s) => s.key.trim() || s.value.trim()),
      };
      const url = editing ? API_ENDPOINTS.PRODUCT(editing.id) : API_ENDPOINTS.PRODUCTS;
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error);

      if (json.newCategory) {
        setCategoriesState((prev) => {
          if (prev.some((c) => c.id === json.newCategory.id)) return prev;
          return [...prev, json.newCategory];
        });
      }

      toast.success(editing ? "Product updated!" : "Product created!");
      setDialogOpen(false);
      const updated = editing
        ? products.map((p) => (p.id === editing.id ? json.data : p))
        : [json.data, ...products];
      setProducts(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Archive this product?")) return;
    const res = await fetch(API_ENDPOINTS.PRODUCT(id), { method: "DELETE" });
    if (res.ok) {
      setProducts(products.map((p) => p.id === id ? { ...p, status: "archived" } : p));
      toast.success("Product archived");
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
            {categoriesState.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="col-span-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} className="mt-1" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={selectedCategoryName}
                onValueChange={(val) => {
                  setSelectedCategoryName(val || "");
                  if (val && val !== "other") {
                    const match = categoriesState.find((c) => c.name.toLowerCase() === val.toLowerCase());
                    setForm({ ...form, category_id: match ? match.id : "" });
                  } else {
                    setForm({ ...form, category_id: "" });
                  }
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownCategories.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedCategoryName === "other" && (
              <div className="col-span-2">
                <Label>Enter New Category</Label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="mt-1"
                  placeholder="e.g. Valentine Gifting"
                />
              </div>
            )}
            <div>
              <Label>Price (₹)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} className="mt-1" />
            </div>
            <div>
              <Label>Original Price (₹)</Label>
              <Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: parseFloat(e.target.value) })} className="mt-1" />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })} className="mt-1" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => v && setForm({ ...form, status: v as ProductStatus })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Badge</Label>
              <Select value={form.badge} onValueChange={(v) => setForm({ ...form, badge: v ?? "" })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="Personalize">Personalize</SelectItem>
                  <SelectItem value="Bestseller">Bestseller</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Limited">Limited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Product Images Section */}
            <div className="col-span-2 border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold text-dark">Product Images</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm((prev) => ({ ...prev, images: [...prev.images, ""] }))}
                  className="h-8 text-xs flex items-center gap-1 border-gold hover:bg-gold/10 hover:text-dark text-dark"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Image URL
                </Button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {form.images.map((img, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={img}
                      onChange={(e) => {
                        const newImages = [...form.images];
                        newImages[index] = e.target.value;
                        setForm({ ...form, images: newImages });
                      }}
                      className="flex-1 text-sm h-9"
                    />
                    {form.images.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index),
                          }));
                        }}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" rows={3} />
            </div>
            <div className="col-span-2">
              <Label>Tags (comma separated)</Label>
              <Input value={form.tags.join(", ")} onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} className="mt-1" placeholder="wood, personalized, luxury" />
            </div>
            
            {/* Product Specifications Section */}
            <div className="col-span-2 border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold text-dark">Product Specifications</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSpecification}
                  className="h-8 text-xs flex items-center gap-1 border-gold hover:bg-gold/10 hover:text-dark text-dark"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Specification
                </Button>
              </div>
              
              {(form.specifications || []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic mb-2">No specifications added yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(form.specifications || []).map((spec, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Specification Key (e.g. Weight)"
                        value={spec.key}
                        onChange={(e) => handleUpdateSpecification(index, 'key', e.target.value)}
                        className="flex-1 text-sm h-9"
                      />
                      <Input
                        placeholder="Specification Value (e.g. 250g)"
                        value={spec.value}
                        onChange={(e) => handleUpdateSpecification(index, 'value', e.target.value)}
                        className="flex-1 text-sm h-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSpecification(index)}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-2 flex items-center gap-3">
              <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
              <Label>Featured product</Label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
            <Button className="flex-1 bg-gold text-dark hover:bg-gold-dark font-semibold" onClick={handleSave} disabled={saving}>
              {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {saving ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
