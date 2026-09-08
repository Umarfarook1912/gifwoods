import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { ADMIN_PERMISSION_IDS } from "@/constants/admin-permissions";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import {
  deleteHomepageCarouselSlide,
  updateHomepageCarouselSlide,
} from "@/lib/db/homepage-carousel";
import { homepageCarouselSlideSchema } from "@/lib/utils/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!hasApiPermission(session, ADMIN_PERMISSION_IDS.CAROUSEL)) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = homepageCarouselSlideSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues[0]?.message ?? APP_ERRORS.VALIDATION },
        { status: 400 }
      );
    }

    const data = await updateHomepageCarouselSlide(id, parsed.data);
    return NextResponse.json({ data, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.CAROUSEL_SAVE_FAILED);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!hasApiPermission(session, ADMIN_PERMISSION_IDS.CAROUSEL)) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await deleteHomepageCarouselSlide(id);
    return NextResponse.json({ data: { id }, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.CAROUSEL_DELETE_FAILED);
  }
}
