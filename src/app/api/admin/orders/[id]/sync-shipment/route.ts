import { NextResponse } from "next/server";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { APP_ERRORS } from "@/constants/errors";
import { getOrderById, updateOrderShipmentFields, updateOrderDeliveryStatus } from "@/lib/db/orders";
import { getShiprocketOrderDetails } from "@/lib/shiprocket/client";

const STATUS_RANK: Record<string, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 4,
};

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!hasApiPermission(session, "orders")) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return NextResponse.json({ data: null, error: "Order not found" }, { status: 404 });
  }

  if (!order.shiprocket_order_id) {
    return NextResponse.json(
      { data: null, error: "Order has not been pushed to Shiprocket yet." },
      { status: 400 }
    );
  }

  try {
    const details = await getShiprocketOrderDetails(order.shiprocket_order_id);

    if (!details?.awb_code) {
      return NextResponse.json(
        { data: null, error: "AWB not assigned yet — please assign a courier in Shiprocket first." },
        { status: 400 }
      );
    }

    const awbCode = details.awb_code;
    const courierName = details.courier_name ?? null;
    const trackingUrl = `https://www.shiprocket.in/shipment-tracking/?id=${awbCode}`;

    await updateOrderShipmentFields(id, { awb_code: awbCode, courier_name: courierName, tracking_url: trackingUrl });

    // Only advance status (never downgrade)
    const currentRank = STATUS_RANK[order.status] ?? 0;
    if (currentRank < STATUS_RANK["shipped"]) {
      await updateOrderDeliveryStatus(id, "shipped");
    }

    return NextResponse.json({
      data: {
        awb_code: awbCode,
        courier_name: courierName,
        tracking_url: trackingUrl,
        status: currentRank < STATUS_RANK["shipped"] ? "shipped" : order.status,
      },
      error: null,
    });
  } catch (error) {
    return apiError(error, APP_ERRORS.ORDER_UPDATE_FAILED);
  }
}
