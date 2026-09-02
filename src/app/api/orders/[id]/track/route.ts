import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/server";
import { getTracking } from "@/lib/shiprocket/client";
import { isMockAwb, buildMockTrackingResponse } from "@/lib/shiprocket/mock";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const userId = session.user.supabaseId ?? session.user.id;

  const { data: order, error } = await supabase
    .from("orders")
    .select("user_id, awb_code")
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ data: null, error: "Order not found" }, { status: 404 });
  }

  const isOwner = (order as { user_id: string }).user_id === userId;
  const isAdmin = hasApiPermission(session, "orders");
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  const awb = (order as { awb_code: string | null }).awb_code;
  if (!awb) {
    return NextResponse.json(
      { data: null, error: "No AWB assigned yet" },
      { status: 404 }
    );
  }

  if (isMockAwb(awb)) {
    return NextResponse.json({ data: buildMockTrackingResponse(), error: null });
  }

  try {
    const tracking = await getTracking(awb);
    return NextResponse.json({ data: tracking, error: null });
  } catch (trackingError) {
    console.error("Shiprocket tracking failed:", trackingError);
    return NextResponse.json(
      { data: null, error: APP_ERRORS.TRACKING_LOAD_FAILED },
      { status: 502 }
    );
  }
}
