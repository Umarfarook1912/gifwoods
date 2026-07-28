import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { auth, hasApiPermission } from "@/lib/auth/auth";
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
  const role = session?.user?.role;
  const isAdmin = role === "admin" || role === "super_admin";
  if (!isAdmin) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const errorMsg = firstIssue
      ? `${firstIssue.path.length ? firstIssue.path.join(".") + ": " : ""}${firstIssue.message}`
      : "Invalid product data";
    return NextResponse.json({ data: null, error: errorMsg }, { status: 400 });
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

  const updateData: Record<string, unknown> = { ...productData };
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
  if (!hasApiPermission(session, "products")) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = await createClient();

  // Products referenced by past orders are archived to preserve order
  // history; cart items and reviews cascade.
  const { count } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);

  if ((count ?? 0) > 0) {
    const { error } = await supabase
      .from("products")
      .update({ status: "archived" })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: { id, action: "archived" }, error: null });
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id, action: "deleted" }, error: null });
}
