import { NextResponse } from "next/server";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/server";
import { createShiprocketShipment } from "@/lib/shiprocket/create-shipment";
import { formatShiprocketPushError } from "@/lib/shiprocket/awb-errors";
import type { ShippingAddress } from "@/types/order";

interface OrderItem {
  quantity: number;
  unit_price: number;
  product: { name: string } | null;
}

interface OrderRow {
  id: string;
  subtotal: number;
  total: number;
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  awb_code: string | null;
  shipping_address: ShippingAddress;
  order_items: OrderItem[] | null;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!hasApiPermission(session, "orders")) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, subtotal, total, shiprocket_order_id, shiprocket_shipment_id, awb_code, shipping_address, order_items(quantity, unit_price, product:products(name))"
    )
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ data: null, error: "Order not found" }, { status: 404 });
  }

  const typedOrder = order as unknown as OrderRow;

  try {
    await createShiprocketShipment(
      {
        id: typedOrder.id,
        subtotal: typedOrder.subtotal,
        total: typedOrder.total,
        shipping_address: typedOrder.shipping_address,
        shiprocket_order_id: typedOrder.shiprocket_order_id,
        shiprocket_shipment_id: typedOrder.shiprocket_shipment_id,
        awb_code: typedOrder.awb_code,
        order_items: typedOrder.order_items,
      },
      { mode: "fulfill" }
    );
    return NextResponse.json({ data: { pushed: true }, error: null });
  } catch (err) {
    const message = formatShiprocketPushError(err);
    console.error("Push to Shiprocket failed:", err);
    return NextResponse.json({ data: null, error: message }, { status: 502 });
  }
}
