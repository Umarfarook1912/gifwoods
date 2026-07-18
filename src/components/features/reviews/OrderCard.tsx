import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate, formatOrderId } from "@/lib/utils/formatters";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils/cn";
import type { Order } from "@/types/order";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  paid: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

interface Props {
  order: Order;
}

export function OrderCard({ order }: Props) {
  const firstItem = order.order_items?.[0];
  const product = firstItem?.product as { images: string[]; name: string } | undefined;

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {product?.images?.[0] && (
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          )}
          <div>
            <p className="font-semibold text-dark text-sm">{formatOrderId(order.id)}</p>
            <p className="text-xs text-warm-gray mt-0.5">{formatDate(order.created_at)}</p>
            {order.order_items && order.order_items.length > 1 && (
              <p className="text-xs text-muted-foreground">
                +{order.order_items.length - 1} more item{order.order_items.length > 2 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-dark">{formatPrice(order.total)}</span>
          <Badge
            variant="outline"
            className={cn("capitalize text-xs", STATUS_STYLES[order.status])}
          >
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="flex gap-3 mt-4 flex-wrap">
        <Button variant="outline" size="sm" className="border-border text-dark hover:border-gold" asChild>
          <Link href={ROUTES.ORDER_DETAIL(order.id)}>View Details</Link>
        </Button>
        {order.status === "delivered" && (
          <Button size="sm" className="bg-gold text-dark hover:bg-gold-dark font-semibold" asChild>
            <Link href={ROUTES.ORDER_DETAIL(order.id) + "#review"}>Write a Review</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
