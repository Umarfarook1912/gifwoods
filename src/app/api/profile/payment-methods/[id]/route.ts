import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { deletePaymentMethod } from "@/lib/supabase/profile-db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const userId = session.user.supabaseId ?? session.user.id;
    const success = await deletePaymentMethod(userId, id);
    
    if (!success) {
      return NextResponse.json({ data: null, error: "Payment method not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error: any) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }
}
