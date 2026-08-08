export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  created_at: string;
}

export type ProductBadge = "Personalize" | "Bestseller" | "New" | "Limited";
export type ProductStatus = "active" | "draft" | "archived";

export interface Product {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  description: string;
  price: number;
  original_price: number | null;
  category_id: string;
  category?: Category;
  images: string[];
  tags: string[];
  stock: number;
  is_featured?: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  badge: ProductBadge | null;
  status: ProductStatus;
  specifications?: Array<{ key: string; value: string }>;
  avg_rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  search?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
  page?: number;
  limit?: number;
}

export interface ProductFormData {
  name: string;
  slug: string;
  code?: string | null;
  description: string;
  price: number;
  original_price?: number;
  category_id?: string | null;
  images: string[];
  tags: string[];
  stock: number;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  badge?: ProductBadge;
  status: ProductStatus;
  specifications?: Array<{ key: string; value: string }>;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface ProductFormState {
  name: string;
  slug: string;
  code: string;
  description: string;
  price: number;
  original_price: number;
  category_id: string;
  images: string[];
  tags: string[];
  stock: number;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  badge: string;
  status: ProductStatus;
  specifications: ProductSpecification[];
}

export interface CustomizationOption {
  type: "text" | "image" | "select";
  label: string;
  key: string;
  required: boolean;
  options?: string[];
  maxLength?: number;
}

export type Customization = Record<string, string>;
