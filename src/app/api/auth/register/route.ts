import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { mapAuthErrorMessage } from "@/lib/errors/user-message";
import { createAuthUser, deleteAuthUser } from "@/lib/auth/user-service";
import { upsertUserProfile } from "@/lib/db/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    let userId: string;
    try {
      userId = await createAuthUser(email, password, { name });
    } catch (authError: unknown) {
      const msg = authError instanceof Error ? authError.message : String(authError);
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("duplicate") ||
        msg.toLowerCase().includes("exists")
      ) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: mapAuthErrorMessage(msg, APP_ERRORS.REGISTRATION_FAILED) },
        { status: 400 }
      );
    }

    try {
      await upsertUserProfile({
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: "user",
        avatar_url: null,
      });
    } catch (profileError) {
      // Clean up orphaned auth user if profile creation fails
      await deleteAuthUser(userId).catch(() => undefined);
      console.error("Profile creation error:", profileError);
      return NextResponse.json(
        { error: APP_ERRORS.ACCOUNT_SETUP_FAILED },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, userId });
  } catch (err) {
    console.error("Register route error:", err);
    return NextResponse.json({ error: APP_ERRORS.REGISTRATION_FAILED }, { status: 500 });
  }
}
