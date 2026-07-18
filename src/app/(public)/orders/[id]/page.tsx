import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReviewForm } from "@/components/features/reviews/ReviewForm";
import { formatPrice, formatDate, formatOrderId } from "@/lib/utils/formatters";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils/cn";
import type { Order, OrderItem } from "@/types/order";
import type { Product } from "@/types/product";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  paid: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Order Details" };

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect(ROUTES.LOGIN);

  const { id } = await params;
  const supabase = await createClient();
  const userId = session.user.supabaseId ?? session.user.id;

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(id, name, images, slug, price))")
    .eq("id", id)
    .single();

  if (!order || ((order as Order).user_id !== userId && session.user.role !== "admin")) {
    notFound();
  }

  const typedOrder = order as Order;
  const addr = typedOrder.shipping_address;

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="page-container max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-dark">
              Order {formatOrderId(typedOrder.id)}
            </h1>
            <p className="text-warm-gray text-sm mt-1">{formatDate(typedOrder.created_at)}</p>
          </div>
          <Badge
            variant="outline"
            className={cn("capitalize text-sm px-3 py-1", STATUS_STYLES[typedOrder.status])}
          >
            {typedOrder.status}
          </Badge>
        </div>

        {/* Order items */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h2 className="font-semibold text-dark mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {typedOrder.order_items?.map((item: OrderItem) => {
              const product = item.product as Product | undefined;
              return (
                <div key={item.id} className="flex gap-4">
                  {product?.images?.[0] && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                      <Image
                        src={product.images[0]}
                        alt={product?.name ?? "Product"}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    {product && (
                      <Link
                        href={ROUTES.PRODUCT(product.slug)}
                        className="font-medium text-dark hover:text-gold text-sm"
                      >
                        {product.name}
                      </Link>
                    )}
                    <p className="text-xs text-warm-gray mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-dark text-sm">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-warm-gray">Subtotal</span>
              <span>{formatPrice(typedOrder.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-gray">Shipping</span>
              <span>{typedOrder.shipping_cost === 0 ? "Free" : formatPrice(typedOrder.shipping_cost)}</span>
            </div>
            <div className="flex justify-between font-bold text-dark pt-2 border-t border-border">
              <span>Total</span>
              <span>{formatPrice(typedOrder.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h2 className="font-semibold text-dark mb-3">Delivery Address</h2>
          <p className="text-dark font-medium text-sm">{addr.name}</p>
          <p className="text-warm-gray text-sm mt-0.5">
            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""},{" "}
            {addr.city}, {addr.state} — {addr.pincode}
          </p>
          <p className="text-warm-gray text-sm">{addr.phone}</p>
        </div>

        {/* Review section */}
        {typedOrder.status === "delivered" && (
          <div id="review" className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-display font-bold text-xl text-dark mb-6">Leave a Review</h2>
            {typedOrder.order_items?.map((item: OrderItem) => {
              const product = item.product as Product | undefined;
              if (!product) return null;
              return (
                <div key={item.id} className="mb-8">
                  <p className="font-medium text-dark mb-4">{product.name}</p>
                  <ReviewForm
                    productId={product.id}
                    orderId={typedOrder.id}
                  />
                  <Separator className="mt-6" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
