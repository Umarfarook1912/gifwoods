import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/server";
import { sendOrderStatusEmail } from "@/lib/email/nodemailer";
import { FULFILLMENT_STATUSES } from "@/constants/ui";
import { z } from "zod";

const orderStatusSchema = z.enum(FULFILLMENT_STATUSES);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();
  const userId = session.user.supabaseId ?? session.user.id;

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(id, name, images, slug, price)), user:profiles(id, name, email)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ data: null, error: "Order not found" }, { status: 404 });
  }

  const isOwner = (data as { user_id: string }).user_id === userId;
  const isAdmin = session.user.role === "admin";
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
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsedStatus = orderStatusSchema.safeParse((await request.json()).status);
  if (!parsedStatus.success) {
    return NextResponse.json(
      { data: null, error: "Invalid order status" },
      { status: 400 }
    );
  }
  const status = parsedStatus.data;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("*, user:profiles(id, name, email)")
    .single();

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 });

  const user = (data as { user: { name: string; email: string } | null }).user;
  if (user?.email) {
    try {
      await sendOrderStatusEmail({
        to: user.email,
        userName: user.name,
        orderId: id,
        status,
      });
    } catch (emailError) {
      console.error("Order status email failed:", emailError);
    }
  }

  return NextResponse.json({ data, error: null });
}
