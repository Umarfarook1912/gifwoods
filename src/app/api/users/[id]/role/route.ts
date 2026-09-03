import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { toUserErrorMessage } from "@/lib/errors/user-message";
import { updateUserRole } from "@/lib/db/users";

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

  try {
    const data = await updateUserRole(id, role);
    return NextResponse.json({ data, error: null });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: toUserErrorMessage(error, APP_ERRORS.ADMIN_PROMOTE_FAILED) },
      { status: 500 }
    );
  }
}
