import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { ADMIN_PERMISSION_IDS } from "@/constants/admin-permissions";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import {
  createHomepageCarouselSlide,
  getActiveHomepageCarouselSlides,
  getAllHomepageCarouselSlides,
} from "@/lib/db/homepage-carousel";
import { homepageCarouselSlideSchema } from "@/lib/utils/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";

  try {
    if (all) {
      const session = await auth();
      if (!hasApiPermission(session, ADMIN_PERMISSION_IDS.CAROUSEL)) {
        return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
      }
      const slides = await getAllHomepageCarouselSlides();
      return NextResponse.json({ data: slides, error: null });
    }

    const slides = await getActiveHomepageCarouselSlides();
    return NextResponse.json({ data: slides, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.CAROUSEL_LOAD_FAILED);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!hasApiPermission(session, ADMIN_PERMISSION_IDS.CAROUSEL)) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = homepageCarouselSlideSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues[0]?.message ?? APP_ERRORS.VALIDATION },
        { status: 400 }
      );
    }

    const data = await createHomepageCarouselSlide(parsed.data);
    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error) {
    return apiError(error, APP_ERRORS.CAROUSEL_SAVE_FAILED);
  }
}
