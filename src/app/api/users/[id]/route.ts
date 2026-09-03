import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { toUserErrorMessage } from "@/lib/errors/user-message";
import { getUserProfileById, updateUserProfile } from "@/lib/db/users";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await getUserProfileById(id);

  if (!data) {
    return NextResponse.json(
      { data: null, error: toUserErrorMessage(null, APP_ERRORS.NOT_FOUND) },
      { status: 404 }
    );
  }
  return NextResponse.json({ data, error: null });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  try {
    const data = await updateUserProfile(id, body);
    return NextResponse.json({ data, error: null });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: toUserErrorMessage(error, APP_ERRORS.PROFILE_SAVE_FAILED) },
      { status: 500 }
    );
  }
}
