import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { slugify } from "@/lib/utils/formatters";
import {
  getCategories,
  getCategoryByName,
  createCategory,
} from "@/lib/db/categories";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const withProducts = searchParams.get("withProducts") === "true";

  try {
    const categories = await getCategories(withProducts);
    return NextResponse.json({ data: categories, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.CATEGORY_LOAD_FAILED);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!hasApiPermission(session, "categories")) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2) {
    return NextResponse.json(
      { data: null, error: "Category name must be at least 2 characters" },
      { status: 400 }
    );
  }

  try {
    const existing = await getCategoryByName(name);
    if (existing) {
      return NextResponse.json(
        { data: null, error: `Category "${existing.name}" already exists` },
        { status: 409 }
      );
    }

    const data = await createCategory({
      name,
      slug: slugify(name),
      description: body.description?.trim() || null,
      image_url: body.image_url?.trim() || null,
    });

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error) {
    return apiError(error, APP_ERRORS.CATEGORY_ADD_FAILED);
  }
}
