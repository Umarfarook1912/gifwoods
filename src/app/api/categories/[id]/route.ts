import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { countProductsInCategory, deleteCategory } from "@/lib/db/categories";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!hasApiPermission(session, "categories")) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const count = await countProductsInCategory(id);
    if (count > 0) {
      return NextResponse.json(
        {
          data: null,
          error: `This category still has ${count} product(s). Move or archive them first.`,
        },
        { status: 409 }
      );
    }

    await deleteCategory(id);
    return NextResponse.json({ data: { id }, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.CATEGORY_DELETE_FAILED);
  }
}
