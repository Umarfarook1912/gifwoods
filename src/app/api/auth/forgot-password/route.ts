import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { sendPasswordResetEmail } from "@/lib/email/nodemailer";
import { isGoogleOnlyUser } from "@/lib/auth/user-service";
import { getUserProfileByEmail } from "@/lib/db/users";
import { createResetToken } from "@/lib/db/password-reset-tokens";
import { ROUTES } from "@/constants/routes";
import crypto from "crypto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawEmail = (body as { email?: string }).email;

    if (!rawEmail?.trim()) {
      return NextResponse.json(
        { success: false, error: APP_ERRORS.VALIDATION },
        { status: 400 }
      );
    }

    const email = rawEmail.toLowerCase().trim();
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const profile = await getUserProfileByEmail(email);
    if (!profile || profile.status === "inactive") {
      // Always return success to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    // Block Google-only accounts from password reset
    const googleOnly = await isGoogleOnlyUser(profile.id).catch(() => false);
    if (googleOnly) {
      return NextResponse.json({ success: true });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error("Forgot password: NEXT_PUBLIC_APP_URL is not configured");
      return NextResponse.json({ success: true });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    await createResetToken(profile.id, token);

    const resetUrl = `${appUrl}${ROUTES.RESET_PASSWORD}?token=${token}`;

    try {
      await sendPasswordResetEmail({
        to: email,
        userName: profile.name,
        resetUrl,
      });
    } catch (emailError) {
      console.error("Forgot password: email send failed", emailError);
      // Still return success — don't leak token generation errors
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot password route error:", err);
    return NextResponse.json(
      { success: false, error: APP_ERRORS.PASSWORD_RESET_FAILED },
      { status: 500 }
    );
  }
}
