import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { getUserOrders } from "@/lib/db/orders";
import type { Order } from "@/types/order";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = session.user.supabaseId ?? session.user.id;

  try {
    const result = await getUserOrders({
      userId,
      status: searchParams.get("status"),
      search: searchParams.get("search"),
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "10"),
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error as Error, APP_ERRORS.GENERIC);
  }
}
