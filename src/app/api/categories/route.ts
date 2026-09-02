import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { createClient } from "@/lib/supabase/server";
import { auth, hasApiPermission } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { slugify } from "@/lib/utils/formatters";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const withProducts = searchParams.get("withProducts") === "true";

  const supabase = await createClient();

  let query;
  if (withProducts) {
    query = supabase
      .from("categories")
      .select("id, name, slug, image_url, description, created_at, products!inner(id)")
      .eq("products.status", "active")
      .order("name", { ascending: true });
  } else {
    query = supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    return apiError(error, APP_ERRORS.CATEGORY_LOAD_FAILED);
  }

  const categories = (data ?? []).map((row) => {
    const { products: _products, ...category } = row as Record<string, unknown>;
    return category;
  });

  return NextResponse.json({ data: categories, error: null });
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

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("categories")
    .select("id, name")
    .ilike("name", name)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { data: null, error: `Category "${existing.name}" already exists` },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug: slugify(name),
      description: body.description?.trim() || null,
      image_url: body.image_url?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return apiError(error, APP_ERRORS.CATEGORY_ADD_FAILED);
  }

  return NextResponse.json({ data, error: null }, { status: 201 });
}
