import { NextResponse } from "next/server";
import { AUTH_PROVIDERS } from "@/constants/auth";
import { APP_ERRORS } from "@/constants/errors";
import { ROUTES } from "@/constants/routes";
import { sendPasswordResetEmail } from "@/lib/email/nodemailer";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function isGoogleOnlyAccount(
  identities: Array<{ provider?: string }> | undefined
): boolean {
  if (!identities?.length) return false;
  return identities.every(
    (identity) => identity.provider === AUTH_PROVIDERS.GOOGLE
  );
}

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

    const email = normalizeEmail(rawEmail);

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, status")
      .eq("email", email)
      .maybeSingle();

    if (!profile || profile.status === "inactive") {
      return NextResponse.json({ success: true });
    }

    const { data: authUserData, error: authUserError } =
      await supabase.auth.admin.getUserById(profile.id);

    if (authUserError || !authUserData.user) {
      console.error("Forgot password: auth user lookup failed", authUserError);
      return NextResponse.json({ success: true });
    }

    if (isGoogleOnlyAccount(authUserData.user.identities)) {
      return NextResponse.json({ success: true });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error("Forgot password: NEXT_PUBLIC_APP_URL is not configured");
      return NextResponse.json({ success: true });
    }

    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${appUrl}${ROUTES.RESET_PASSWORD}`,
        },
      });

    if (linkError || !linkData.properties?.action_link) {
      console.error("Forgot password: generateLink failed", linkError);
      return NextResponse.json({ success: true });
    }

    try {
      await sendPasswordResetEmail({
        to: email,
        userName: profile.name,
        resetUrl: linkData.properties.action_link,
      });
    } catch (emailError) {
      console.error("Forgot password: email send failed", emailError);
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
