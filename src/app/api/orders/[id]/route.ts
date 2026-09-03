import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { sendOrderStatusEmail } from "@/lib/email/nodemailer";
import { FULFILLMENT_STATUSES } from "@/constants/ui";
import { z } from "zod";
import {
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "@/lib/db/orders";

const orderStatusSchema = z.enum(FULFILLMENT_STATUSES);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.supabaseId ?? session.user.id;

  const data = await getOrderById(id);
  if (!data) {
    return NextResponse.json({ data: null, error: "Order not found" }, { status: 404 });
  }

  const isOwner = (data as unknown as { user_id: string }).user_id === userId;
  const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ data, error: null });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!hasApiPermission(session, "orders")) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const parsedStatus = orderStatusSchema.safeParse((await request.json()).status);
  if (!parsedStatus.success) {
    return NextResponse.json({ data: null, error: "Invalid order status" }, { status: 400 });
  }

  try {
    const status = parsedStatus.data;
    const data = await updateOrderStatus(id, status);

    const typedData = data as unknown as {
      tracking_url?: string | null;
      user: { name: string; email: string } | null;
    };
    if (typedData.user?.email) {
      try {
        await sendOrderStatusEmail({
          to: typedData.user.email,
          userName: typedData.user.name,
          orderId: id,
          status,
          trackingUrl: status === "shipped" ? (typedData.tracking_url ?? null) : null,
        });
      } catch (emailError) {
        console.error("Order status email failed:", emailError);
      }
    }

    return NextResponse.json({ data, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.ORDER_UPDATE_FAILED);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!hasApiPermission(session, "orders")) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await deleteOrder(id);
    return NextResponse.json({ data: { id, action: "deleted" }, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.ORDER_DELETE_FAILED);
  }
}
