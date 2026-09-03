import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { updateAddress, deleteAddress } from "@/lib/db/addresses";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const userId = session.user.supabaseId ?? session.user.id;
    const body = await request.json();

    const data = await updateAddress(userId, id, body);
    return NextResponse.json({ data, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.ADDRESS_SAVE_FAILED);
  }
}

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
    const success = await deleteAddress(userId, id);
    
    if (!success) {
      return NextResponse.json({ data: null, error: "Address not found or delete failed" }, { status: 444 });
    }
    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.ADDRESS_DELETE_FAILED);
  }
}
