import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import { ReviewForm } from "@/components/features/reviews/ReviewForm";
import { PaymentReturnNotice } from "@/components/features/orders/PaymentReturnNotice";
import { OrderStatusBadges } from "@/components/shared/OrderStatusBadges";
import { formatPrice, formatDate, formatOrderId } from "@/lib/utils/formatters";
import { getPaymentStatus } from "@/lib/orders/status";
import { ROUTES } from "@/constants/routes";
import { buildLoginHref } from "@/lib/auth/callback-url";
import type { Order, OrderItem } from "@/types/order";
import type { Product } from "@/types/product";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export const metadata: Metadata = { title: "Order Details" };

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const session = await auth();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!session) {
    const paymentQuery = query.payment ? `?payment=${query.payment}` : "";
    redirect(buildLoginHref(ROUTES.ORDER_DETAIL(id) + paymentQuery));
  }
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
      <PaymentReturnNotice orderId={typedOrder.id} paymentResult={query.payment} />
      <div className="page-container max-w-3xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-dark">
              Order {formatOrderId(typedOrder.id)}
            </h1>
            <p className="text-warm-gray text-sm mt-1">{formatDate(typedOrder.created_at)}</p>
          </div>
          <OrderStatusBadges order={typedOrder} />
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

        {typedOrder.payment_id && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-border bg-white p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15">
              <CreditCard className="h-4 w-4 text-gold" />
            </span>
            <div>
              <h2 className="font-semibold text-dark">Payment details</h2>
              <p className="mt-1 text-sm capitalize text-warm-gray">
                {typedOrder.payment_method ?? "Online payment"} ·{" "}
                {getPaymentStatus(typedOrder)}
              </p>
              <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                Transaction ID: {typedOrder.payment_id}
              </p>
            </div>
          </div>
        )}

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
