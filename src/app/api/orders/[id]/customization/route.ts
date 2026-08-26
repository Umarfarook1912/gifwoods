import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CUSTOMIZATION_UPLOAD } from "@/constants/customization";
import { customizationFolder, uploadToImageKit } from "@/lib/imagekit/upload";
import { getPaymentStatus } from "@/lib/orders/status";
import { isCustomizationComplete, sanitizeFileStem } from "@/lib/customization";
import type { Customization } from "@/types/product";
import type { Order } from "@/types/order";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

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
  const formData = await request.formData();
  const orderItemId = String(formData.get("orderItemId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const file = formData.get("file");

  if (!orderItemId) {
    return NextResponse.json({ data: null, error: "Missing order item" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const userId = session.user.supabaseId ?? session.user.id;

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, payment_status, payment_id, order_items(id, customization, product:products(customization_text, customization_image, slug, category:categories(name, slug)))"
    )
    .eq("id", orderId)
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ data: null, error: "Order not found" }, { status: 404 });
  }

  if ((order as { user_id: string }).user_id !== userId) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }
  if (getPaymentStatus(order as Order) !== "paid") {
    return NextResponse.json({ data: null, error: "Pay first to submit details" }, { status: 400 });
  }

  const items = ((order as { order_items: ItemRow[] }).order_items ?? []) as ItemRow[];
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
      return NextResponse.json({ data: null, error: "Enter at least 2 characters" }, { status: 400 });
    }
    next.name = name;
  }

  if (wantsImage) {
    if (!(file instanceof File)) {
      return NextResponse.json({ data: null, error: "Please upload a photo" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ data: null, error: "Use a JPG, PNG, or WebP image" }, { status: 400 });
    }
    if (file.size > CUSTOMIZATION_UPLOAD.MAX_BYTES) {
      return NextResponse.json({ data: null, error: "Image must be under 5 MB" }, { status: 400 });
    }
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const folder = customizationFolder(
      item.product.category?.slug ?? item.product.category?.name ?? item.product.slug
    );
    const stem = sanitizeFileStem(
      name || next.name || "",
      CUSTOMIZATION_UPLOAD.FALLBACK_FILE
    );
    const buffer = Buffer.from(await file.arrayBuffer());
    let uploaded;
    try {
      try {
        uploaded = await uploadToImageKit(buffer, `${stem}.${ext}`, folder, false);
      } catch {
        uploaded = await uploadToImageKit(
          buffer,
          `${stem}-${orderItemId.slice(0, 6)}.${ext}`,
          folder,
          false
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Photo upload failed";
      return NextResponse.json({ data: null, error: message }, { status: 500 });
    }
    next.photo = uploaded.url;
  }

  const { data: updated, error: updErr } = await supabase
    .from("order_items")
    .update({ customization: next })
    .eq("id", orderItemId)
    .eq("order_id", orderId)
    .select("id, customization")
    .single();

  if (updErr) {
    return NextResponse.json({ data: null, error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ data: updated, error: null });
}
