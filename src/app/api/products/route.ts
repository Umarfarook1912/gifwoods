import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { toUserErrorMessage } from "@/lib/errors/user-message";
import { productSchema } from "@/lib/utils/validators";
import { ITEMS_PER_PAGE } from "@/constants/ui";
import type { PaginatedResponse } from "@/types/common";
import type { Product } from "@/types/product";
import {
  getProducts,
  createProduct,
  findOrCreateInlineCategory,
} from "@/lib/db/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? String(ITEMS_PER_PAGE));

  try {
    const result = await getProducts({
      category: searchParams.get("category"),
      search: searchParams.get("search"),
      sort: searchParams.get("sort"),
      featured: searchParams.get("featured"),
      bestseller: searchParams.get("bestseller"),
      newArrival: searchParams.get("newArrival"),
      page,
      limit,
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
    });
    return NextResponse.json<PaginatedResponse<Product>>(result);
  } catch (error) {
    return apiError(error, APP_ERRORS.PRODUCT_LOAD_FAILED);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!hasApiPermission(session, "products")) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: APP_ERRORS.VALIDATION }, { status: 400 });
  }

  const { new_category_name, ...productData } = parsed.data;
  let finalCategoryId = productData.category_id;
  let newCategoryObj = null;

  try {
    if (new_category_name) {
      const { id, category } = await findOrCreateInlineCategory(new_category_name);
      finalCategoryId = id;
      newCategoryObj = category;
    }

    if (!finalCategoryId) {
      return NextResponse.json({ data: null, error: "Category is required" }, { status: 400 });
    }

    const data = await createProduct({ ...productData, category_id: finalCategoryId });
    return NextResponse.json({ data, newCategory: newCategoryObj, error: null }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: toUserErrorMessage(error, APP_ERRORS.PRODUCT_SAVE_FAILED) },
      { status: 500 }
    );
  }
}
