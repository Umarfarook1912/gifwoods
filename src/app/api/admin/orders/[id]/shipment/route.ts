import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { APP_ERRORS } from "@/constants/errors";
import { getOrderById } from "@/lib/db/orders";
import { applyOrderShipment } from "@/lib/orders/apply-shipment";

const manualShipmentSchema = z.object({
  awb_code: z.string().trim().min(3).max(64),
  courier_name: z.string().trim().max(120).optional().nullable(),
});

export async function POST(
  request: Request,
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

  const body = await request.json();
  const parsed = manualShipmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: APP_ERRORS.VALIDATION }, { status: 400 });
  }

  try {
    const data = await applyOrderShipment(id, order.status, {
      awb_code: parsed.data.awb_code,
      courier_name: parsed.data.courier_name?.trim() || null,
    });
    return NextResponse.json({ data, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.SHIPMENT_SAVE_FAILED);
  }
}
