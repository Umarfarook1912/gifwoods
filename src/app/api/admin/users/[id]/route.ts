import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { mapAuthErrorMessage, toUserErrorMessage } from "@/lib/errors/user-message";
import { createAdminClient } from "@/lib/supabase/admin";

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

    const supabase = createAdminClient();

    // 1. If password is provided, update it in Supabase Auth
    if (password && password.trim()) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters." },
          { status: 400 }
        );
      }
      const { error: authError } = await supabase.auth.admin.updateUserById(id, {
        password: password,
      });
      if (authError) {
        return NextResponse.json(
          { error: mapAuthErrorMessage(authError.message, APP_ERRORS.ADMIN_UPDATE_FAILED) },
          { status: 400 }
        );
      }
    }

    // 2. Update profile table
    const updatePayload: any = {};
    if (name) updatePayload.name = name.trim();
    if (status) updatePayload.status = status;
    if (permissions) updatePayload.permissions = permissions;
    if (role) updatePayload.role = role;

    const { data, error: profileError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (profileError) {
      console.error(APP_ERRORS.ADMIN_UPDATE_FAILED, profileError);
      return NextResponse.json(
        { error: toUserErrorMessage(profileError, APP_ERRORS.ADMIN_UPDATE_FAILED) },
        { status: 500 }
      );
    }

    // 3. Update auth metadata (name) if changed
    if (name) {
      await supabase.auth.admin.updateUserById(id, {
        user_metadata: { name: name.trim() },
      });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err) {
    console.error("Admin user update API error:", err);
    return NextResponse.json(
      { error: APP_ERRORS.ADMIN_UPDATE_FAILED },
      { status: 500 }
    );
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
    const supabase = createAdminClient();

    // Delete user from auth (cascades to public.profiles)
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      console.error(APP_ERRORS.ADMIN_DELETE_FAILED, error);
      return NextResponse.json(
        { error: toUserErrorMessage(error, APP_ERRORS.ADMIN_DELETE_FAILED) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin user delete API error:", err);
    return NextResponse.json(
      { error: APP_ERRORS.ADMIN_DELETE_FAILED },
      { status: 500 }
    );
  }
}
