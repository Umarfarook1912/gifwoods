import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { auth, hasApiPermission } from "@/lib/auth/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!hasApiPermission(session, "categories")) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      {
        data: null,
        error: `This category still has ${count} product(s). Move or archive them first.`,
      },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id }, error: null });
}
