import type { Order } from "@/types/order";

type OrderWithItems = Pick<Order, "order_items">;

export function getOrderProductSummary(order: OrderWithItems): string {
  const items = order.order_items ?? [];
  const firstName = items[0]?.product?.name;

  if (!firstName) return "Gift order";
  if (items.length === 1) return firstName;

  return `${firstName} +${items.length - 1} more`;
}
