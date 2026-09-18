import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { getTracking } from "@/lib/shiprocket/client";
import { isMockAwb, buildMockTrackingResponse } from "@/lib/shiprocket/mock";
import { getOrderTracking, updateOrderDeliveryStatus } from "@/lib/db/orders";
import {
  inferOrderStatusFromTracking,
  shouldAdvanceOrderStatus,
} from "@/lib/orders/shiprocket-status";
import type { OrderStatus } from "@/types/order";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.supabaseId ?? session.user.id;

  const order = await getOrderTracking(id);
  if (!order) {
    return NextResponse.json({ data: null, error: "Order not found" }, { status: 404 });
  }

  const isOwner = order.user_id === userId;
  const isAdmin = hasApiPermission(session, "orders");
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  if (!order.awb_code) {
    return NextResponse.json({ data: null, error: "No AWB assigned yet" }, { status: 404 });
  }

  if (isMockAwb(order.awb_code)) {
    return NextResponse.json({
      data: buildMockTrackingResponse(),
      orderStatus: order.status as OrderStatus,
      error: null,
    });
  }

  try {
    const tracking = await getTracking(order.awb_code);
    let orderStatus = order.status as OrderStatus;

    const inferred = inferOrderStatusFromTracking(tracking);
    if (inferred && shouldAdvanceOrderStatus(orderStatus, inferred)) {
      try {
        await updateOrderDeliveryStatus(id, inferred);
        orderStatus = inferred;
      } catch (syncErr) {
        console.error("Track sync: status update failed", syncErr);
      }
    }

    return NextResponse.json({ data: tracking, orderStatus, error: null });
  } catch (trackingError) {
    console.error("Shiprocket tracking failed:", trackingError);
    return NextResponse.json(
      { data: null, error: APP_ERRORS.TRACKING_LOAD_FAILED },
      { status: 502 }
    );
  }
}
