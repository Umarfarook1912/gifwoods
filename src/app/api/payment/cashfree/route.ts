import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import {
  createCashfreeOrder,
  createCashfreeOrderId,
  resolveCashfreeMode,
  toCashfreeJsMode,
} from "@/lib/payment/cashfree";
import { apiError } from "@/lib/errors/api-response";
import { toUserErrorMessage } from "@/lib/errors/user-message";
import { calculateShipping } from "@/lib/orders/pricing";
import { API_ENDPOINTS } from "@/constants/api";
import { DELIVERY_METHODS } from "@/constants/shipping";
import { z } from "zod";
import { shippingAddressSchema } from "@/lib/utils/validators";
import {
  getProductsForCheckout,
  createOrder,
  createOrderItems,
  cancelOrder,
} from "@/lib/db/orders";

const orderPayloadSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().positive(),
      customization: z.record(z.string(), z.string()).nullable().optional(),
    })
  ),
  shipping_address: shippingAddressSchema,
  shipping_method: z
    .enum([DELIVERY_METHODS.NORMAL, DELIVERY_METHODS.FAST])
    .default(DELIVERY_METHODS.NORMAL),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { data: null, error: "Please sign in to checkout" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = orderPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: APP_ERRORS.VALIDATION }, { status: 400 });
  }

  const userId = session.user.supabaseId ?? session.user.id;

  const productIds = [...new Set(parsed.data.items.map((item) => item.product_id))];

  let products;
  try {
    products = await getProductsForCheckout(productIds);
  } catch (error) {
    return apiError(error, APP_ERRORS.PRODUCT_LOAD_FAILED);
  }

  if (products.length !== productIds.length) {
    return NextResponse.json(
      { data: null, error: "One or more products are unavailable" },
      { status: 400 }
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
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

  const hasTest = pricedItems.some((item) => Boolean(item.product.is_test));
  const hasNormal = pricedItems.some((item) => !item.product.is_test);
  if (hasTest && hasNormal) {
    return NextResponse.json(
      { data: null, error: APP_ERRORS.MIXED_TEST_CART },
      { status: 400 }
    );
  }

  const isTestOrder = hasTest && !hasNormal;
  const subtotal = pricedItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const shippingMethod = parsed.data.shipping_method;
  const shippingCost = calculateShipping(subtotal, shippingMethod, { isTestOrder });
  const total = subtotal + shippingCost;
  const cashfreeMode = resolveCashfreeMode(isTestOrder);

  let order;
  try {
    order = await createOrder({
      user_id: userId,
      status: "pending",
      payment_status: "pending",
      subtotal,
      shipping_cost: shippingCost,
      shipping_method: shippingMethod,
      is_test_order: isTestOrder,
      total,
      shipping_address: parsed.data.shipping_address as Record<string, unknown>,
    });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: toUserErrorMessage(error, APP_ERRORS.ORDER_CREATE_FAILED) },
      { status: 500 }
    );
  }

  try {
    await createOrderItems(
      pricedItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        customization: item.customization ?? null,
      }))
    );
  } catch (error) {
    await cancelOrder(order.id);
    return apiError(error, APP_ERRORS.ORDER_CREATE_FAILED);
  }

  try {
    const cashfreeOrderId = createCashfreeOrderId(order.id);
    const cashfreeOrder = await createCashfreeOrder(
      {
        order_id: cashfreeOrderId,
        order_amount: total,
        order_currency: "INR",
        customer_details: {
          customer_id: userId,
          customer_name: session.user.name ?? "Customer",
          customer_email: session.user.email ?? "",
          customer_phone: parsed.data.shipping_address.phone.replace(/^\+91/, ""),
        },
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}${API_ENDPOINTS.PAYMENT_VERIFY}?orderId=${order.id}`,
          notify_url: `${process.env.NEXT_PUBLIC_APP_URL}${API_ENDPOINTS.WEBHOOK_CASHFREE}`,
        },
      },
      cashfreeMode
    );

    return NextResponse.json({
      data: {
        order_id: order.id,
        payment_session_id: cashfreeOrder.payment_session_id,
        paymentEnv: toCashfreeJsMode(cashfreeMode),
        subtotal,
        shipping_cost: shippingCost,
        total,
      },
      error: null,
    });
  } catch (error) {
    await cancelOrder(order.id);
    return apiError(error, APP_ERRORS.PAYMENT_INIT_FAILED, 502);
  }
}
