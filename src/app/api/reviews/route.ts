import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { reviewSchema } from "@/lib/utils/validators";
import {
  getProductReviews,
  getAllReviews,
  createReview,
  checkReviewEligibility,
} from "@/lib/db/reviews";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const isApproved = searchParams.get("isApproved");

  try {
    const isApprovedVal =
      isApproved === "true" ? true : isApproved === "false" ? false : undefined;

    if (productId) {
      const data = await getProductReviews(productId, isApprovedVal);
      return NextResponse.json({ data, error: null });
    } else {
      const data = await getAllReviews();
      return NextResponse.json({ data, error: null });
    }
  } catch (error) {
    return apiError(error, APP_ERRORS.GENERIC);
  }
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
    return NextResponse.json({ data: null, error: APP_ERRORS.VALIDATION }, { status: 400 });
  }

  const userId = session.user.supabaseId ?? session.user.id;

  try {
    if (parsed.data.order_id) {
      const isEligible = await checkReviewEligibility(
        userId,
        parsed.data.product_id,
        parsed.data.order_id
      );
      if (!isEligible) {
        return NextResponse.json(
          { data: null, error: "You can only review products from delivered orders" },
          { status: 403 }
        );
      }
    }

    const data = await createReview(userId, {
      product_id: parsed.data.product_id,
      order_id: parsed.data.order_id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error) {
    return apiError(error, APP_ERRORS.REVIEW_SUBMIT_FAILED);
  }
}
