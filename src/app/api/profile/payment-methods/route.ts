import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getPaymentMethods, createPaymentMethod } from "@/lib/supabase/profile-db";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.supabaseId ?? session.user.id;
    const data = await getPaymentMethods(userId);
    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.supabaseId ?? session.user.id;
    const body = await request.json();

    const { provider, method_type, last4, brand, upi_id, wallet_name, expiry_month, expiry_year, is_default } = body;
    if (!method_type) {
      return NextResponse.json({ data: null, error: "Method type is required" }, { status: 400 });
    }

    const data = await createPaymentMethod(userId, {
      provider: provider || "stripe",
      method_type,
      last4: last4 || null,
      brand: brand || null,
      upi_id: upi_id || null,
      wallet_name: wallet_name || null,
      expiry_month: expiry_month ? parseInt(expiry_month) : null,
      expiry_year: expiry_year ? parseInt(expiry_year) : null,
      token: `tok_${Math.random().toString(36).substring(2, 15)}`,
      is_default: !!is_default,
    });

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }
}
