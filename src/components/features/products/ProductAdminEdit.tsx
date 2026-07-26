"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminProductForm } from "@/components/features/admin/AdminProductForm";
import { API_ENDPOINTS } from "@/constants/api";
import { PRODUCT_EDIT_LABEL } from "@/constants/ui";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import type { Category, Product } from "@/types/product";

interface Props {
  product: Product;
  onUpdated: (product: Product) => void;
}

export function ProductAdminEdit({ product, onUpdated }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  if (session?.user?.role !== "admin") return null;

  const openEditor = async () => {
    setOpen(true);
    if (categories.length > 0) return;
    setLoadingCategories(true);
    try {
      const res = await fetch(API_ENDPOINTS.CATEGORIES);
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed to load categories");
      setCategories(json.data ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load categories");
      setOpen(false);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSaved = (updated: Product, _newCategory: Category | null) => {
    onUpdated(updated);
    setOpen(false);
    if (updated.slug !== product.slug) {
      router.push(ROUTES.PRODUCT(updated.slug));
    } else {
      router.refresh();
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-12 px-4 border-border hover:border-gold gap-2"
        onClick={openEditor}
        disabled={loadingCategories}
      >
        <Pencil className="h-4 w-4" />
        {PRODUCT_EDIT_LABEL}
      </Button>

      <AdminProductForm
        open={open}
        onOpenChange={setOpen}
        editing={product}
        categories={categories}
        onSaved={handleSaved}
      />
    </>
  );
}
