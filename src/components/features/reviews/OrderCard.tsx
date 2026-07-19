import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderStatusBadges } from "@/components/shared/OrderStatusBadges";
import { formatPrice, formatDate } from "@/lib/utils/formatters";
import { getOrderProductSummary } from "@/lib/orders/display";
import { ROUTES } from "@/constants/routes";
import type { Order } from "@/types/order";

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
            <p className="font-semibold text-dark text-sm">
              {getOrderProductSummary(order)}
            </p>
            <p className="text-xs text-warm-gray mt-0.5">{formatDate(order.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-dark">{formatPrice(order.total)}</span>
          <OrderStatusBadges order={order} compact />
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
