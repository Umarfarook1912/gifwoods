import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { getMyProductReview } from "@/lib/db/reviews";

/** Current user's review for a product (pending or approved). */
export async function GET(request: Request) {
  const session = await auth();
  if (!session || session.user.isGuest) {
    return NextResponse.json(
      { data: null, error: "Please sign in to view your review" },
      { status: 401 }
    );
  }

  const productId = new URL(request.url).searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ data: null, error: APP_ERRORS.VALIDATION }, { status: 400 });
  }

  try {
    const userId = session.user.supabaseId ?? session.user.id;
    const data = await getMyProductReview(userId, productId);
    return NextResponse.json({ data, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.GENERIC);
  }
}
