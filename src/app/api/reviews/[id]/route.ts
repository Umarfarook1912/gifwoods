import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { updateReview, deleteReview } from "@/lib/supabase/reviews-db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!hasApiPermission(session, "reviews")) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const data = await updateReview(id, body);
    return NextResponse.json({ data, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.REVIEW_UPDATE_FAILED);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!hasApiPermission(session, "reviews")) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const success = await deleteReview(id);
    if (!success) {
      return NextResponse.json({ data: null, error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json({ data: { id }, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.GENERIC);
  }
}
