import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { toUserErrorMessage } from "@/lib/errors/user-message";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "super_admin") {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { role } = await request.json();

  if (!["user", "admin", "super_admin"].includes(role)) {
    return NextResponse.json({ data: null, error: "Invalid role" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(APP_ERRORS.ADMIN_PROMOTE_FAILED, error);
    return NextResponse.json(
      { data: null, error: toUserErrorMessage(error, APP_ERRORS.ADMIN_PROMOTE_FAILED) },
      { status: 500 }
    );
  }
  return NextResponse.json({ data, error: null });
}
