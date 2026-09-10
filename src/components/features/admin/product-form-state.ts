import { toDatetimeLocalValue } from "@/lib/utils/datetime-local";
import type { Product, ProductFormState } from "@/types/product";

export const EMPTY_PRODUCT_FORM: ProductFormState = {
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
  is_test: false,
  customization_text: false,
  customization_image: false,
  badge: "",
  status: "active",
  offer_type: "",
  offer_value: 0,
  offer_starts_at: "",
  offer_ends_at: "",
  specifications: [],
};

export function productToFormState(product: Product): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    code: product.code ?? "",
    description: product.description,
    price: product.price,
    original_price: product.original_price ?? 0,
    category_id: product.category_id ?? "",
    images: product.images.length > 0 ? product.images : [""],
    tags: product.tags,
    stock: product.stock,
    is_bestseller: product.is_bestseller ?? false,
    is_new_arrival: product.is_new_arrival ?? false,
    is_test: product.is_test ?? false,
    customization_text: product.customization_text ?? false,
    customization_image: product.customization_image ?? false,
    badge: product.badge ?? "",
    status: product.status,
    offer_type: product.offer_type ?? "",
    offer_value: product.offer_value != null ? Number(product.offer_value) : 0,
    offer_starts_at: toDatetimeLocalValue(product.offer_starts_at),
    offer_ends_at: toDatetimeLocalValue(product.offer_ends_at),
    specifications: product.specifications ?? [],
  };
}
