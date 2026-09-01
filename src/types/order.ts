import type { Product, Customization } from "./product";
import type { UserProfile } from "./user";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type CheckoutStep = "address" | "review" | "payment";

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
  payment_status: OrderPaymentStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: ShippingAddress;
  payment_id: string | null;
  payment_method: string | null;
  confirmation_email_sent_at?: string | null;
  order_items?: OrderItem[];
  created_at: string;
  updated_at: string;
  // Shiprocket integration
  shiprocket_order_id?: string | null;
  shiprocket_shipment_id?: string | null;
  awb_code?: string | null;
  courier_name?: string | null;
  tracking_url?: string | null;
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
