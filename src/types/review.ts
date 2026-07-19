import type { UserProfile } from "./user";
import type { Product } from "./product";

export interface Review {
  id: string;
  user_id: string;
  user?: UserProfile;
  product_id: string;
  product?: Pick<Product, "id" | "name" | "slug">;
  order_id?: string | null;
  rating: number;
  comment: string;
  is_approved: boolean;
  admin_reply?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewFormData {
  product_id: string;
  order_id?: string | null;
  rating: number;
  comment: string;
}


export interface ReviewFilters {
  productId?: string;
  minRating?: number;
  maxRating?: number;
  isApproved?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
