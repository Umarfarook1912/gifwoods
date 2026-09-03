import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { toUserErrorMessage } from "@/lib/errors/user-message";
import { productSchema } from "@/lib/utils/validators";
import {
  getProductByIdOrSlug,
  updateProduct,
  archiveProduct,
  deleteProduct,
  countOrderItemsByProduct,
  findOrCreateInlineCategory,
} from "@/lib/db/products";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const data = await getProductByIdOrSlug(id);
  if (!data) {
    return NextResponse.json({ data: null, error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ data, error: null });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "admin" && role !== "super_admin") {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: APP_ERRORS.VALIDATION }, { status: 400 });
  }

  const { new_category_name, ...productData } = parsed.data;
  let finalCategoryId = productData.category_id;
  let newCategoryObj = null;

  try {
    if (new_category_name) {
      const { id: catId, category } = await findOrCreateInlineCategory(new_category_name);
      finalCategoryId = catId;
      newCategoryObj = category;
    }

    const updateData: Record<string, unknown> = { ...productData };
    if (finalCategoryId !== undefined) updateData.category_id = finalCategoryId;

    const data = await updateProduct(id, updateData);
    return NextResponse.json({ data, newCategory: newCategoryObj, error: null });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: toUserErrorMessage(error, APP_ERRORS.PRODUCT_SAVE_FAILED) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!hasApiPermission(session, "products")) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Products referenced by past orders are archived to preserve order history.
    const count = await countOrderItemsByProduct(id);
    if (count > 0) {
      await archiveProduct(id);
      return NextResponse.json({ data: { id, action: "archived" }, error: null });
    }

    await deleteProduct(id);
    return NextResponse.json({ data: { id, action: "deleted" }, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.PRODUCT_DELETE_FAILED);
  }
}
