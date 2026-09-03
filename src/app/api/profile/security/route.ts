import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { toUserErrorMessage } from "@/lib/errors/user-message";
import { updateAuthPassword } from "@/lib/auth/user-service";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.supabaseId ?? session.user.id;
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { data: null, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await updateAuthPassword(userId, password);
    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error(APP_ERRORS.PASSWORD_UPDATE_FAILED, error);
    return NextResponse.json(
      { data: null, error: toUserErrorMessage(error, APP_ERRORS.PASSWORD_UPDATE_FAILED) },
      { status: 500 }
    );
  }
}
