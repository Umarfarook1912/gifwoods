import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { mapAuthErrorMessage, toUserErrorMessage } from "@/lib/errors/user-message";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, permissions, status } = body as {
      name?: string;
      email?: string;
      password?: string;
      permissions?: string[];
      status?: "active" | "inactive";
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

    const supabase = createAdminClient();

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });

    if (authError) {
      if (
        authError.message.toLowerCase().includes("already") ||
        authError.message.toLowerCase().includes("duplicate") ||
        authError.message.toLowerCase().includes("exists")
      ) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: mapAuthErrorMessage(authError.message, APP_ERRORS.ADMIN_CREATE_FAILED) },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create Auth account." },
        { status: 500 }
      );
    }

    // 2. Create the profile row with admin role and selected permissions
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: authData.user.id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: "admin",
        permissions: permissions || [],
        status: status || "active",
      },
      { onConflict: "id", ignoreDuplicates: false }
    );

    if (profileError) {
      // Clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.error(APP_ERRORS.ADMIN_CREATE_FAILED, profileError);
      return NextResponse.json(
        { error: toUserErrorMessage(profileError, APP_ERRORS.ADMIN_CREATE_FAILED) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err) {
    console.error("Admin user create API error:", err);
    return NextResponse.json(
      { error: APP_ERRORS.ADMIN_CREATE_FAILED },
      { status: 500 }
    );
  }
}
