import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { mapAuthErrorMessage } from "@/lib/errors/user-message";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
    };

    // ── Basic validation ────────────────────────────────────────────────────
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

    const supabase = createAdminClient();

    // ── Create user in Supabase Auth ────────────────────────────────────────
    // email_confirm: true  → skip email verification (confirm immediately)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });

    if (authError) {
      // "User already registered" → Supabase returns a 422 with this message
      if (
        authError.message.toLowerCase().includes("already") ||
        authError.message.toLowerCase().includes("duplicate") ||
        authError.message.toLowerCase().includes("exists")
      ) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: mapAuthErrorMessage(authError.message, APP_ERRORS.REGISTRATION_FAILED) },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    // ── Upsert the profiles row ─────────────────────────────────────────────
    // The Supabase `handle_new_user` trigger may already create this row.
    // We upsert (ignoreDuplicates: false) so name is always set correctly.
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: authData.user.id,   // real Supabase auth.users UUID — satisfies FK
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: "user",
        avatar_url: null,
      },
      { onConflict: "id", ignoreDuplicates: false }
    );

    if (profileError) {
      // Profile creation failed — clean up the auth user so we don't leave
      // an orphan in auth.users
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.error("Profile creation error:", profileError.message);
      return NextResponse.json(
        { error: APP_ERRORS.ACCOUNT_SETUP_FAILED },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err) {
    console.error("Register route error:", err);
    return NextResponse.json(
      { error: APP_ERRORS.REGISTRATION_FAILED },
      { status: 500 }
    );
  }
}
