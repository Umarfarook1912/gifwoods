import { NextResponse } from "next/server";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/server";
import { getTracking } from "@/lib/shiprocket/client";

export async function GET(
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
    .select("awb_code")
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ data: null, error: "Order not found" }, { status: 404 });
  }

  const awb = (order as { awb_code: string | null }).awb_code;
  if (!awb) {
    return NextResponse.json(
      { data: null, error: "No AWB assigned yet" },
      { status: 404 }
    );
  }

  try {
    const tracking = await getTracking(awb);
    return NextResponse.json({ data: tracking, error: null });
  } catch (trackingError) {
    console.error("Shiprocket tracking failed:", trackingError);
    return NextResponse.json(
      { data: null, error: "Failed to fetch tracking info" },
      { status: 502 }
    );
  }
}
