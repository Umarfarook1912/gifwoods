import { NextResponse } from "next/server";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import {
  createCashfreeOrderId,
  getCashfreeOrder,
  getCashfreeOrderPayments,
} from "@/lib/payment/cashfree";
import { completePaidOrder } from "@/lib/orders/complete-payment";
import { ROUTES } from "@/constants/routes";
import { getOrderOwner } from "@/lib/db/orders";

export async function GET(request: Request) {
  const session = await auth();
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

  if (!session || !orderId) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, url.origin));
  }

  const userId = session.user.supabaseId ?? session.user.id;
  const order = await getOrderOwner(orderId);

  if (!order || (order.user_id !== userId && !hasApiPermission(session, "orders"))) {
    return NextResponse.redirect(new URL(ROUTES.ORDERS, url.origin));
  }

  try {
    const cashfreeOrderId = createCashfreeOrderId(orderId);
    const cashfreeOrder = await getCashfreeOrder(cashfreeOrderId);

    if (cashfreeOrder.order_status === "PAID") {
      const payments = await getCashfreeOrderPayments(cashfreeOrderId);
      const successfulPayment = payments.find((p) => p.payment_status === "SUCCESS");
      await completePaidOrder(orderId, successfulPayment?.cf_payment_id ?? cashfreeOrderId);
      return NextResponse.redirect(
        new URL(`${ROUTES.ORDER_DETAIL(orderId)}?payment=success`, url.origin)
      );
    }

    return NextResponse.redirect(
      new URL(`${ROUTES.ORDER_DETAIL(orderId)}?payment=pending`, url.origin)
    );
  } catch (error) {
    console.error("Cashfree return verification failed:", error);
    return NextResponse.redirect(
      new URL(`${ROUTES.ORDER_DETAIL(orderId)}?payment=verification-failed`, url.origin)
    );
  }
}
