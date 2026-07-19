import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  createCashfreeOrder,
  createCashfreeOrderId,
} from "@/lib/payment/cashfree";
import { createClient } from "@/lib/supabase/server";
import { calculateShipping } from "@/lib/orders/pricing";
import { API_ENDPOINTS } from "@/constants/api";
import { z } from "zod";
import { shippingAddressSchema } from "@/lib/utils/validators";

const orderPayloadSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().positive(),
      customization: z.record(z.string(), z.string()).nullable().optional(),
    })
  ),
  shipping_address: shippingAddressSchema,
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Please sign in to checkout" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = orderPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }

  const supabase = await createClient();
  const userId = session.user.supabaseId ?? session.user.id;

  const productIds = [...new Set(parsed.data.items.map((item) => item.product_id))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, price, stock, status")
    .in("id", productIds);

  if (productsError || products?.length !== productIds.length) {
    return NextResponse.json(
      { data: null, error: "One or more products are unavailable" },
      { status: 400 }
    );
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const pricedItems = parsed.data.items.map((item) => {
    const product = productMap.get(item.product_id)!;
    return { ...item, unit_price: Number(product.price), product };
  });

  const unavailable = pricedItems.find(
    (item) => item.product.status !== "active" || item.quantity > item.product.stock
  );
  if (unavailable) {
    return NextResponse.json(
      { data: null, error: "A product is out of stock or unavailable" },
      { status: 400 }
    );
  }

  const subtotal = pricedItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const shippingCost = calculateShipping(subtotal);
  const total = subtotal + shippingCost;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending",
      payment_status: "pending",
      subtotal,
      shipping_cost: shippingCost,
      total,
      shipping_address: parsed.data.shipping_address,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ data: null, error: orderError?.message }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    pricedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      customization: item.customization ?? null,
    }))
  );
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json(
      { data: null, error: itemsError.message },
      { status: 500 }
    );
  }

  try {
    const cashfreeOrderId = createCashfreeOrderId(order.id);
    const cashfreeOrder = await createCashfreeOrder({
      order_id: cashfreeOrderId,
      order_amount: total,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_name: session.user.name ?? "Customer",
        customer_email: session.user.email ?? "",
        customer_phone: parsed.data.shipping_address.phone,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}${API_ENDPOINTS.PAYMENT_VERIFY}?orderId=${order.id}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}${API_ENDPOINTS.WEBHOOK_CASHFREE}`,
      },
    });

    return NextResponse.json({
      data: {
        order_id: order.id,
        payment_session_id: cashfreeOrder.payment_session_id,
        subtotal,
        shipping_cost: shippingCost,
        total,
      },
      error: null,
    });
  } catch (error) {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return NextResponse.json(
      {
        data: null,
        error: error instanceof Error ? error.message : "Payment initiation failed",
      },
      { status: 502 }
    );
  }
}
