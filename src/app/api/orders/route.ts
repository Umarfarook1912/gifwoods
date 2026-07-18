import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/types/order";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  const supabase = await createClient();
  const userId = session.user.supabaseId ?? session.user.id;
  const isAdmin = session.user.role === "admin";

  let query = supabase
    .from("orders")
    .select(
      "*, order_items(*, product:products(id, name, images, slug)), user:profiles(id, name, email)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (!isAdmin) {
    query = query.eq("user_id", userId);
  }

  if (status) query = query.eq("status", status);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: (data ?? []) as Order[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
    error: null,
  });
}
