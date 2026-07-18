import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth/auth";
import { reviewSchema } from "@/lib/utils/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const isApproved = searchParams.get("isApproved");

  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("*, user:profiles(id, name, avatar_url)")
    .order("created_at", { ascending: false });

  if (productId) query = query.eq("product_id", productId);
  if (isApproved !== null) query = query.eq("is_approved", isApproved === "true");

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.isGuest) {
    return NextResponse.json(
      { data: null, error: "Please sign in to leave a review" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }

  const supabase = await createClient();
  const userId = session.user.supabaseId;

  // Verify user purchased the product and order is delivered
  const { data: eligible } = await supabase
    .from("order_items")
    .select("id, order:orders!inner(id, user_id, status)")
    .eq("product_id", parsed.data.product_id)
    .eq("order_id", parsed.data.order_id);

  const isEligible = eligible?.some((item) => {
    const order = (item.order as unknown) as Record<string, unknown> | null;
    return order?.user_id === userId && order?.status === "delivered";
  });

  if (!isEligible) {
    return NextResponse.json(
      { data: null, error: "You can only review products from delivered orders" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({ ...parsed.data, user_id: userId, is_approved: false })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null }, { status: 201 });
}
