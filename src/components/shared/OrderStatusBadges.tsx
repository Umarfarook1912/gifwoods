import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { getPaymentStatus } from "@/lib/orders/status";
import type { OrderStatusSummary } from "@/lib/orders/status";

const ORDER_STYLES: Record<string, string> = {
  pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
  processing: "border-purple-200 bg-purple-50 text-purple-700",
  shipped: "border-indigo-200 bg-indigo-50 text-indigo-700",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

const PAYMENT_STYLES: Record<string, string> = {
  pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  refunded: "border-blue-200 bg-blue-50 text-blue-700",
};

interface Props {
  order: OrderStatusSummary;
  compact?: boolean;
  className?: string;
}

export function OrderStatusBadges({ order, compact = false, className }: Props) {
  const paymentStatus = getPaymentStatus(order);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Badge
        variant="outline"
        className={cn("capitalize", compact && "text-xs", PAYMENT_STYLES[paymentStatus])}
      >
        Payment: {paymentStatus}
      </Badge>
      <Badge
        variant="outline"
        className={cn("capitalize", compact && "text-xs", ORDER_STYLES[order.status])}
      >
        Order: {order.status}
      </Badge>
    </div>
  );
}
