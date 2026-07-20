import type { Order, OrderPaymentStatus } from "@/types/order";

export type OrderStatusSummary = Pick<
  Order,
  "status" | "payment_status" | "payment_id"
>;

const PAID_FULFILLMENT_STATUSES = new Set([
  "processing",
  "shipped",
  "delivered",
]);

export function getPaymentStatus(order: OrderStatusSummary): OrderPaymentStatus {
  if (order.payment_status) return order.payment_status;
  if (order.payment_id || PAID_FULFILLMENT_STATUSES.has(order.status)) return "paid";
  return order.status === "cancelled" ? "failed" : "pending";
}

export function canDownloadInvoice(order: OrderStatusSummary): boolean {
  return getPaymentStatus(order) === "paid" && order.status === "delivered";
}
