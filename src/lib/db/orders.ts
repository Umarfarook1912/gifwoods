/**
 * DB service — Orders
 *
 * TODAY:  wraps Supabase PostgREST queries
 * LATER:  swap internals to pool.query() — callers stay unchanged
 *
 * Covers: user orders, admin orders, order items, payment/Shiprocket fields,
 *         complete-payment helper, and delivery-update webhook.
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderStatus } from "@/types/order";
import type { PaginatedResponse } from "@/types/common";

// ── Query filter types ────────────────────────────────────────────────────────

export interface UserOrderFilters {
  userId: string;
  status?: string | null;
  search?: string | null;
  page?: number;
  limit?: number;
}

export interface AdminOrderFilters {
  status?: string | null;
  search?: string | null;
  page?: number;
  limit?: number;
}

// ── Read ──────────────────────────────────────────────────────────────────────

/** Paginated orders for a specific user (My Orders page). */
export async function getUserOrders(
  filters: UserOrderFilters
): Promise<PaginatedResponse<Order>> {
  const { userId, status, page = 1, limit = 10 } = filters;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      "*, order_items(*, product:products(id, name, images, slug)), user:profiles(id, name, email)",
      { count: "exact" }
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as Order[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
    error: null,
  };
}

/** Paginated orders for admin panel (all users). */
export async function getAdminOrders(
  filters: AdminOrderFilters
): Promise<PaginatedResponse<Order>> {
  const { status, search, page = 1, limit = 10 } = filters;
  const supabase = createAdminClient();

  let query = supabase
    .from("orders")
    .select(
      "*, order_items(*, product:products(id, name, images, slug)), user:profiles(id, name, email)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (search) {
    query = query.or(`id.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as Order[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
    error: null,
  };
}

/** Single order with full detail (items + user). */
export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "*, order_items(*, product:products(id, name, images, slug, price, customization_text, customization_image)), user:profiles(id, name, email)"
    )
    .eq("id", id)
    .single();
  return (data as Order) ?? null;
}

/** Order with only id and user_id (ownership check). */
export async function getOrderOwner(
  orderId: string
): Promise<{ id: string; user_id: string; is_test_order: boolean } | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("id, user_id, is_test_order")
    .eq("id", orderId)
    .single();
  return (data as { id: string; user_id: string; is_test_order: boolean }) ?? null;
}

/** Minimal order for invoice rendering. */
export async function getOrderForInvoice(orderId: string): Promise<Order | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(id, name, images, slug, price))")
    .eq("id", orderId)
    .single();
  return (data as Order) ?? null;
}

/** Order + items for customization PATCH. */
export async function getOrderForCustomization(orderId: string): Promise<Record<string, unknown> | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, payment_status, payment_id, order_items(id, customization, product:products(customization_text, customization_image, slug, category:categories(name, slug)))"
    )
    .eq("id", orderId)
    .single();
  return (data as Record<string, unknown>) ?? null;
}

/** Order + AWB for tracking. */
export async function getOrderTracking(
  orderId: string
): Promise<{ user_id: string; awb_code: string | null } | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("user_id, awb_code")
    .eq("id", orderId)
    .single();
  return (data as { user_id: string; awb_code: string | null }) ?? null;
}

/** Full order for complete-payment helper. */
export async function getOrderForPaymentCompletion(orderId: string): Promise<Record<string, unknown> | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, status, subtotal, shipping_cost, total, confirmation_email_sent_at, shipping_address, user:profiles(name, email), order_items(quantity, unit_price, product:products(name, customization_text, customization_image))"
    )
    .eq("id", orderId)
    .single();
  return (data as Record<string, unknown>) ?? null;
}

const DELIVERY_WEBHOOK_ORDER_SELECT =
  "id, status, awb_code, tracking_url, shiprocket_order_id, user:profiles(name, email)";

/** Find order by AWB code (delivery webhook). */
export async function getOrderByAwb(awbCode: string): Promise<Record<string, unknown> | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select(DELIVERY_WEBHOOK_ORDER_SELECT)
    .eq("awb_code", awbCode)
    .single();
  return (data as Record<string, unknown>) ?? null;
}

/** Find order by Gifwoods order UUID (Shiprocket channel order_id). */
export async function getOrderByIdForDeliveryWebhook(
  orderId: string
): Promise<Record<string, unknown> | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select(DELIVERY_WEBHOOK_ORDER_SELECT)
    .eq("id", orderId)
    .single();
  return (data as Record<string, unknown>) ?? null;
}

/** Find order by Shiprocket sr_order_id. */
export async function getOrderByShiprocketOrderId(
  shiprocketOrderId: string
): Promise<Record<string, unknown> | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select(DELIVERY_WEBHOOK_ORDER_SELECT)
    .eq("shiprocket_order_id", shiprocketOrderId)
    .single();
  return (data as Record<string, unknown>) ?? null;
}

/** Persist AWB / courier / tracking after Shiprocket Ship Now. */
export async function updateOrderShipmentFields(
  orderId: string,
  payload: {
    awb_code: string;
    courier_name?: string | null;
    tracking_url: string;
  }
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").update(payload).eq("id", orderId);
  if (error) throw error;
}

/** Find order id by Cashfree order id prefix (webhook lookup). */
export async function findOrderIdByCashfreeRef(
  candidateId: string
): Promise<{ id: string } | null> {
  const supabase = createAdminClient();
  const query = supabase.from("orders").select("id");
  const { data } =
    candidateId.length === 36
      ? await query.eq("id", candidateId).single()
      : await query.ilike("id", `${candidateId}%`).single();
  return (data as { id: string }) ?? null;
}

/** Recent 5 orders for dashboard. */
export async function getRecentOrders(): Promise<Record<string, unknown>[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, status, payment_status, payment_id, total, created_at, user:profiles(name, email), order_items(id, product:products(name))"
    )
    .order("created_at", { ascending: false })
    .limit(5);
  return (data ?? []) as Record<string, unknown>[];
}

// ── Validate products for checkout ───────────────────────────────────────────

export interface CheckoutProduct {
  id: string;
  price: number;
  stock: number;
  status: string;
  is_test: boolean;
}

export async function getProductsForCheckout(productIds: string[]): Promise<CheckoutProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, price, stock, status, is_test")
    .in("id", productIds);
  if (error) throw error;
  return (data ?? []) as CheckoutProduct[];
}

// ── Write ─────────────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  user_id: string;
  status: OrderStatus;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  shipping_method?: string;
  is_test_order?: boolean;
  total: number;
  shipping_address: Record<string, unknown>;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Order;
}

export interface CreateOrderItemPayload {
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  customization?: Record<string, string> | null;
}

export async function createOrderItems(items: CreateOrderItemPayload[]): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("order_items").insert(items);
  if (error) throw error;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("*, user:profiles(id, name, email)")
    .single();
  if (error) throw error;
  return data as Order;
}

export async function updateOrderPayment(
  orderId: string,
  payload: {
    status: string;
    payment_status: string;
    payment_id: string;
    payment_method: string;
  }
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update(payload)
    .eq("id", orderId);
  if (error) throw error;
}

export async function markOrderEmailSent(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("orders")
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq("id", orderId);
}

export async function cancelOrder(orderId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
}

export async function cancelOrderWithPaymentFailed(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("orders")
    .update({ status: "cancelled", payment_status: "failed" })
    .eq("id", orderId);
}

export async function deleteOrder(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").delete().eq("id", orderId);
  if (error) throw error;
}

export async function updateOrderItemCustomization(
  orderItemId: string,
  orderId: string,
  customization: Record<string, string>
): Promise<{ id: string; customization: Record<string, string> }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("order_items")
    .update({ customization })
    .eq("id", orderItemId)
    .eq("order_id", orderId)
    .select("id, customization")
    .single();
  if (error) throw error;
  return data as { id: string; customization: Record<string, string> };
}

export async function updateOrderDeliveryStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw error;
}
