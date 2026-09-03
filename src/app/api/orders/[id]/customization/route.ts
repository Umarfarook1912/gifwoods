import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { getPaymentStatus } from "@/lib/orders/status";
import { isCustomizationComplete } from "@/lib/customization";
import type { Customization } from "@/types/product";
import {
  getOrderForCustomization,
  updateOrderItemCustomization,
} from "@/lib/db/orders";

interface ItemRow {
  id: string;
  customization: Customization | null;
  product: {
    customization_text: boolean;
    customization_image: boolean;
    slug?: string;
    category?: { name: string; slug: string } | null;
  } | null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { id: orderId } = await params;
  let orderItemId = "";
  let name = "";
  let whatsappSent = false;

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = await request.json().catch(() => ({}));
    orderItemId = String(json.orderItemId ?? "");
    name = String(json.name ?? "").trim();
    whatsappSent = Boolean(json.whatsapp_sent);
  } else {
    const formData = await request.formData();
    orderItemId = String(formData.get("orderItemId") ?? "");
    name = String(formData.get("name") ?? "").trim();
    whatsappSent = formData.get("whatsapp_sent") === "true";
  }

  if (!orderItemId) {
    return NextResponse.json({ data: null, error: "Missing order item" }, { status: 400 });
  }

  const userId = session.user.supabaseId ?? session.user.id;

  try {
    const order = await getOrderForCustomization(orderId);
    if (!order) {
      return NextResponse.json({ data: null, error: "Order not found" }, { status: 404 });
    }

    if ((order as { user_id: string }).user_id !== userId) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    if (
      getPaymentStatus({
        status: order.status as import("@/types/order").OrderStatus,
        payment_status: order.payment_status as import("@/types/order").OrderPaymentStatus,
        payment_id: order.payment_id as string | null,
      }) !== "paid"
    ) {
      return NextResponse.json(
        { data: null, error: "Pay first to submit details" },
        { status: 400 }
      );
    }

    const items = ((order as unknown as { order_items: ItemRow[] }).order_items ?? []) as ItemRow[];
    const item = items.find((row) => row.id === orderItemId);
    if (!item?.product) {
      return NextResponse.json({ data: null, error: "Item not found" }, { status: 404 });
    }

    if (isCustomizationComplete(item.customization, item.product)) {
      return NextResponse.json({ data: null, error: "Details already received" }, { status: 409 });
    }

    const wantsText = item.product.customization_text;
    const wantsImage = item.product.customization_image;
    if (!wantsText && !wantsImage) {
      return NextResponse.json({ data: null, error: "No customization needed" }, { status: 400 });
    }

    const next: Customization = { ...(item.customization ?? {}) };
    if (wantsText) {
      if (name.length < 2) {
        return NextResponse.json(
          { data: null, error: "Enter at least 2 characters" },
          { status: 400 }
        );
      }
      next.name = name;
    }
    if (wantsImage || whatsappSent) next.whatsapp_sent = "true";

    const updated = await updateOrderItemCustomization(orderItemId, orderId, next);
    return NextResponse.json({ data: updated, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.CUSTOMIZATION_SUBMIT_FAILED);
  }
}
