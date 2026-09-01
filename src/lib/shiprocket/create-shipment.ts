import { createAdminClient } from "@/lib/supabase/admin";
import {
  createShiprocketOrder,
  assignAWB,
  schedulePickup,
} from "@/lib/shiprocket/client";
import type { ShiprocketOrderPayload } from "@/types/shiprocket";
import type { ShippingAddress } from "@/types/order";

interface MinimalOrder {
  id: string;
  subtotal: number;
  shipping_address: ShippingAddress;
  order_items: Array<{
    quantity: number;
    unit_price: number;
    product: { name: string } | null;
  }> | null;
}

export async function createShiprocketShipment(order: MinimalOrder): Promise<void> {
  const addr = order.shipping_address;
  const pickupLocation =
    process.env.SHIPROCKET_PICKUP_LOCATION ?? "Gifwoods Warehouse";

  const orderItems = (order.order_items ?? []).map((item, i) => ({
    name: item.product?.name ?? `Item ${i + 1}`,
    sku: `SKU-${i + 1}`,
    units: item.quantity,
    selling_price: Number(item.unit_price),
  }));

  const payload: ShiprocketOrderPayload = {
    order_id: order.id,
    order_date: new Date().toISOString().slice(0, 19),
    pickup_location: pickupLocation,
    billing_customer_name: addr.name,
    billing_phone: addr.phone,
    billing_address: [addr.line1, addr.line2].filter(Boolean).join(", "),
    billing_city: addr.city,
    billing_state: addr.state,
    billing_country: addr.country ?? "India",
    billing_pincode: addr.pincode,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: "Prepaid",
    sub_total: Number(order.subtotal),
    // Default dimensions — adjust if you have per-product weight/size
    length: 15,
    breadth: 12,
    height: 10,
    weight: 0.5,
  };

  // 1. Create order on Shiprocket
  const orderResp = await createShiprocketOrder(payload);
  const shipmentId = orderResp.shipment_id;

  // 2. Assign AWB (auto-select cheapest courier)
  const awbResp = await assignAWB(shipmentId);
  const awbCode = awbResp.response?.data?.awb_code;
  const courierName = awbResp.response?.data?.courier_name ?? "Courier";

  // 3. Schedule pickup
  await schedulePickup(shipmentId);

  // 4. Build tracking URL
  const trackingUrl = `https://www.shiprocket.in/shipment-tracking/?id=${awbCode}`;

  // 5. Persist to orders table
  const supabase = createAdminClient();
  await supabase
    .from("orders")
    .update({
      shiprocket_order_id: String(orderResp.order_id),
      shiprocket_shipment_id: String(shipmentId),
      awb_code: awbCode,
      courier_name: courierName,
      tracking_url: trackingUrl,
    })
    .eq("id", order.id);
}
