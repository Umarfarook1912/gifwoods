import type { Product, Customization } from "./product";
import type { UserProfile } from "./user";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface ShippingAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  customization: Customization | null;
}

export interface Order {
  id: string;
  user_id: string;
  user?: UserProfile;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: ShippingAddress;
  payment_id: string | null;
  payment_method: string | null;
  order_items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CreateOrderPayload {
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    customization?: Customization;
  }>;
  shipping_address: ShippingAddress;
  subtotal: number;
  shipping_cost: number;
  total: number;
}
