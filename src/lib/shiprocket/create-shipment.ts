import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_SHIPMENT_WEIGHT_KG } from "@/constants/shipping";
import {
  createShiprocketOrder,
  assignAWB,
  schedulePickup,
  checkCourierServiceability,
} from "@/lib/shiprocket/client";
import { pickCourierId } from "@/lib/shipping/parse-serviceability";
import {
  isShiprocketMockEnabled,
  buildMockAwbFields,
} from "@/lib/shiprocket/mock";
import { formatShiprocketAwbError } from "@/lib/shiprocket/awb-errors";
import type { ShiprocketOrderPayload } from "@/types/shiprocket";
import type { ShippingAddress } from "@/types/order";
import { splitCustomerName } from "@/lib/shiprocket/split-customer-name";

const SHIPMENT_WEIGHT_KG = 0.5;

interface MinimalOrder {
  id: string;
  subtotal: number;
  total: number;
  shipping_address: ShippingAddress;
  shiprocket_order_id?: string | null;
  shiprocket_shipment_id?: string | null;
  awb_code?: string | null;
  order_items: Array<{
    quantity: number;
    unit_price: number;
    product: { name: string } | null;
  }> | null;
}

type ShipmentMode = "sync" | "fulfill";

function buildOrderPayload(order: MinimalOrder): ShiprocketOrderPayload {
  const addr = order.shipping_address;
  const pickupLocation =
    process.env.SHIPROCKET_PICKUP_LOCATION ?? "Gifwoods Warehouse";
  const { firstName, lastName } = splitCustomerName(addr.name);

  const orderItems = (order.order_items ?? []).map((item, i) => ({
    name: item.product?.name ?? `Item ${i + 1}`,
    sku: `SKU-${i + 1}`,
    units: item.quantity,
    selling_price: Number(item.unit_price),
  }));

  return {
    order_id: order.id,
    order_date: new Date().toISOString().slice(0, 19),
    pickup_location: pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
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
    length: 15,
    breadth: 12,
    height: 10,
    weight: SHIPMENT_WEIGHT_KG,
  };
}

async function resolveCourierId(order: MinimalOrder): Promise<number | null> {
  const pickupPostcode = process.env.SHIPROCKET_PICKUP_PINCODE ?? "";
  const deliveryPostcode = order.shipping_address.pincode;
  if (!pickupPostcode || !deliveryPostcode) return null;

  const serviceability = await checkCourierServiceability({
    pickupPostcode,
    deliveryPostcode,
    weightKg: SHIPMENT_WEIGHT_KG || DEFAULT_SHIPMENT_WEIGHT_KG,
    declaredValue: Number(order.total),
    cod: 0,
  });

  return pickCourierId(serviceability.data?.available_courier_companies ?? []);
}

async function ensureShiprocketOrder(
  order: MinimalOrder
): Promise<{ shipmentId: string; shiprocketOrderId: string }> {
  if (order.shiprocket_shipment_id && order.shiprocket_order_id) {
    return {
      shipmentId: order.shiprocket_shipment_id,
      shiprocketOrderId: order.shiprocket_order_id,
    };
  }

  const orderResp = await createShiprocketOrder(buildOrderPayload(order));
  return {
    shipmentId: String(orderResp.shipment_id),
    shiprocketOrderId: String(orderResp.order_id),
  };
}

export async function createShiprocketShipment(
  order: MinimalOrder,
  options: { mode?: ShipmentMode } = {}
): Promise<void> {
  if (order.awb_code) return;

  const mode =
    options.mode ?? (isShiprocketMockEnabled() ? "sync" : "fulfill");
  const supabase = createAdminClient();

  const { shipmentId, shiprocketOrderId } = await ensureShiprocketOrder(order);

  await supabase
    .from("orders")
    .update({
      shiprocket_order_id: shiprocketOrderId,
      shiprocket_shipment_id: shipmentId,
    })
    .eq("id", order.id);

  if (mode === "sync") {
    // Admin assigns AWB later via Shiprocket Ship Now; webhook saves awb_code.
    return;
  }

  if (isShiprocketMockEnabled()) {
    await supabase
      .from("orders")
      .update(buildMockAwbFields(order.id))
      .eq("id", order.id);
    return;
  }

  const courierId = await resolveCourierId(order);
  const awbResp = await assignAWB(shipmentId, courierId ?? undefined);
  const awbCode = awbResp.response?.data?.awb_code;
  const courierName = awbResp.response?.data?.courier_name ?? "Courier";

  if (awbResp.awb_assign_status !== 1 || !awbCode) {
    console.error("Shiprocket AWB assignment failed:", awbResp);
    throw new Error(formatShiprocketAwbError(awbResp));
  }

  try {
    await schedulePickup(shipmentId);
  } catch (pickupError) {
    console.warn("Shiprocket pickup scheduling failed (AWB still saved):", pickupError);
  }

  await supabase
    .from("orders")
    .update({
      awb_code: awbCode,
      courier_name: courierName,
      tracking_url: `https://www.shiprocket.in/shipment-tracking/?id=${awbCode}`,
    })
    .eq("id", order.id);
}
