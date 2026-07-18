import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createCashfreeOrder } from "@/lib/payment/cashfree";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { shippingAddressSchema } from "@/lib/utils/validators";

const orderPayloadSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().positive(),
      unit_price: z.number().positive(),
      customization: z.record(z.string(), z.string()).optional(),
    })
  ),
  shipping_address: shippingAddressSchema,
  subtotal: z.number().positive(),
  shipping_cost: z.number().min(0),
  total: z.number().positive(),
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

  // Create order in DB
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending",
      subtotal: parsed.data.subtotal,
      shipping_cost: parsed.data.shipping_cost,
      total: parsed.data.total,
      shipping_address: parsed.data.shipping_address,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ data: null, error: orderError?.message }, { status: 500 });
  }

  // Create order items
  await supabase.from("order_items").insert(
    parsed.data.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      customization: item.customization ?? null,
    }))
  );

  // Create Cashfree order
  const cashfreeOrder = await createCashfreeOrder({
    order_id: `GW_${order.id.slice(0, 8).toUpperCase()}`,
    order_amount: parsed.data.total,
    order_currency: "INR",
    customer_details: {
      customer_id: userId,
      customer_name: session.user.name ?? "Customer",
      customer_email: session.user.email ?? "",
      customer_phone: parsed.data.shipping_address.phone,
    },
    order_meta: {
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?payment=success`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/cashfree`,
    },
  });

  return NextResponse.json({
    data: {
      order_id: order.id,
      payment_session_id: cashfreeOrder.payment_session_id,
    },
    error: null,
  });
}
