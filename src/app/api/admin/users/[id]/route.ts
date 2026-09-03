import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { mapAuthErrorMessage, toUserErrorMessage } from "@/lib/errors/user-message";
import {
  updateAuthPassword,
  updateAuthMeta,
  deleteAuthUser,
} from "@/lib/auth/user-service";
import { adminUpdateUserProfile } from "@/lib/db/users";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, status, permissions, password, role } = body as {
      name?: string;
      status?: "active" | "inactive";
      permissions?: string[];
      password?: string;
      role?: "admin" | "user";
    };

    // 1. Update password in Auth if provided
    if (password?.trim()) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters." },
          { status: 400 }
        );
      }
      try {
        await updateAuthPassword(id, password);
      } catch (authError: unknown) {
        const msg = authError instanceof Error ? authError.message : String(authError);
        return NextResponse.json(
          { error: mapAuthErrorMessage(msg, APP_ERRORS.ADMIN_UPDATE_FAILED) },
          { status: 400 }
        );
      }
    }

    // 2. Update profile table
    const data = await adminUpdateUserProfile(id, { name, status, permissions, role });

    // 3. Sync name to Auth metadata if changed
    if (name) {
      await updateAuthMeta(id, { name: name.trim() }).catch(() => undefined);
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err) {
    console.error("Admin user update API error:", err);
    return NextResponse.json({ error: APP_ERRORS.ADMIN_UPDATE_FAILED }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    try {
      await deleteAuthUser(id);
    } catch (error) {
      console.error(APP_ERRORS.ADMIN_DELETE_FAILED, error);
      return NextResponse.json(
        { error: toUserErrorMessage(error, APP_ERRORS.ADMIN_DELETE_FAILED) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin user delete API error:", err);
    return NextResponse.json({ error: APP_ERRORS.ADMIN_DELETE_FAILED }, { status: 500 });
  }
}
