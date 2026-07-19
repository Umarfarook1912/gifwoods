import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth/auth";
import { productSchema } from "@/lib/utils/validators";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .or(`id.eq.${id},slug.eq.${id}`)
    .eq("status", "active")
    .single();

  if (error || !data) {
    return NextResponse.json({ data: null, error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ data, error: null });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }

  const { new_category_name, ...productData } = parsed.data;
  let finalCategoryId = productData.category_id;
  let newCategoryObj = null;

  const supabase = await createClient();

  if (new_category_name) {
    const { data: existingCat } = await supabase
      .from("categories")
      .select("*")
      .ilike("name", new_category_name.trim())
      .limit(1)
      .maybeSingle();

    if (existingCat) {
      finalCategoryId = existingCat.id;
    } else {
      const slug = new_category_name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { data: newCat, error: insertCatError } = await supabase
        .from("categories")
        .insert({
          name: new_category_name.trim(),
          slug,
        })
        .select()
        .single();

      if (insertCatError) {
        return NextResponse.json({ data: null, error: `Failed to create category: ${insertCatError.message}` }, { status: 500 });
      }

      newCategoryObj = newCat;
      finalCategoryId = newCat.id;
    }
  }

  const updateData: any = { ...productData };
  if (finalCategoryId !== undefined) {
    updateData.category_id = finalCategoryId;
  }

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, newCategory: newCategoryObj, error: null });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id }, error: null });
}
