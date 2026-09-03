import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { getTracking } from "@/lib/shiprocket/client";
import { isMockAwb, buildMockTrackingResponse } from "@/lib/shiprocket/mock";
import { getOrderTracking } from "@/lib/db/orders";

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
    return NextResponse.json({ data: buildMockTrackingResponse(), error: null });
  }

  try {
    const tracking = await getTracking(order.awb_code);
    return NextResponse.json({ data: tracking, error: null });
  } catch (trackingError) {
    console.error("Shiprocket tracking failed:", trackingError);
    return NextResponse.json(
      { data: null, error: APP_ERRORS.TRACKING_LOAD_FAILED },
      { status: 502 }
    );
  }
}
