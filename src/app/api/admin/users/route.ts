import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { mapAuthErrorMessage, toUserErrorMessage } from "@/lib/errors/user-message";
import { createAuthUser, deleteAuthUser } from "@/lib/auth/user-service";
import { upsertUserProfile } from "@/lib/db/users";

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
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: mapAuthErrorMessage(msg, APP_ERRORS.ADMIN_CREATE_FAILED) },
        { status: 400 }
      );
    }

    try {
      await upsertUserProfile({
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: "admin",
        permissions: permissions ?? [],
        status: status ?? "active",
      });
    } catch (profileError) {
      await deleteAuthUser(userId).catch(() => undefined);
      console.error(APP_ERRORS.ADMIN_CREATE_FAILED, profileError);
      return NextResponse.json(
        { error: toUserErrorMessage(profileError, APP_ERRORS.ADMIN_CREATE_FAILED) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, userId });
  } catch (err) {
    console.error("Admin user create API error:", err);
    return NextResponse.json({ error: APP_ERRORS.ADMIN_CREATE_FAILED }, { status: 500 });
  }
}
