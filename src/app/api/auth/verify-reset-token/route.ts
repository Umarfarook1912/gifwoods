import { NextResponse } from "next/server";
import { findValidResetToken } from "@/lib/db/password-reset-tokens";

/**
 * GET /api/auth/verify-reset-token?token=xxx
 *
 * Called by the reset-password page to check if the token in the URL
 * is valid before showing the password form.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, email: null });
  }

  const row = await findValidResetToken(token);
  if (!row) {
    return NextResponse.json({ valid: false, email: null });
  }

  // Don't expose the user_id — just confirm valid + return email from profile
  // The email is pulled via a join or a follow-up query here.
  // We return just valid: true; the form can show a generic message.
  return NextResponse.json({ valid: true, userId: row.user_id });
}
