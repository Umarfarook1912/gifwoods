import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { updateAuthPassword } from "@/lib/auth/user-service";
import { findValidResetToken, markTokenUsed } from "@/lib/db/password-reset-tokens";

/**
 * POST /api/auth/reset-password
 *
 * Body: { token: string; password: string }
 * Validates token, updates password, marks token used.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body as { token?: string; password?: string };

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Token and new password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const row = await findValidResetToken(token);
    if (!row) {
      return NextResponse.json(
        { success: false, error: "Reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    await updateAuthPassword(row.user_id, password);
    await markTokenUsed(token);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password route error:", err);
    return NextResponse.json(
      { success: false, error: APP_ERRORS.PASSWORD_UPDATE_FAILED },
      { status: 500 }
    );
  }
}
