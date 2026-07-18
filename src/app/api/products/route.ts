import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth/auth";
import { productSchema } from "@/lib/utils/validators";
import { ITEMS_PER_PAGE } from "@/constants/ui";
import type { ApiResponse, PaginatedResponse } from "@/types/common";
import type { Product } from "@/types/product";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") ?? "newest";
  const featured = searchParams.get("featured");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? String(ITEMS_PER_PAGE));
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `*, category:categories(id, name, slug),
       reviews(rating)`,
      { count: "exact" }
    )
    .eq("status", "active");

  if (category) query = query.eq("categories.slug", category);
  if (featured === "true") query = query.eq("is_featured", true);
  if (minPrice) query = query.gte("price", parseFloat(minPrice));
  if (maxPrice) query = query.lte("price", parseFloat(maxPrice));
  if (search) query = query.ilike("name", `%${search}%`);

  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: error.message },
      { status: 500 }
    );
  }

  const products = (data ?? []).map((p) => {
    const rawP = p as Record<string, unknown>;
    const reviews = (rawP.reviews as Array<{ rating: number }>) ?? [];
    const avg_rating =
      reviews.length > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : undefined;
    const { reviews: _reviews, ...rest } = rawP;
    return { ...rest, avg_rating, review_count: reviews.length };
  });

  return NextResponse.json<PaginatedResponse<Product>>({
    data: products as unknown as Product[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
    error: null,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null }, { status: 201 });
}
