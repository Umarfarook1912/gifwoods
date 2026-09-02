import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { toUserErrorMessage } from "@/lib/errors/user-message";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();

  if (error) {
    console.error(APP_ERRORS.NOT_FOUND, error);
    return NextResponse.json(
      { data: null, error: toUserErrorMessage(error, APP_ERRORS.NOT_FOUND) },
      { status: 404 }
    );
  }
  return NextResponse.json({ data, error: null });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(APP_ERRORS.PROFILE_SAVE_FAILED, error);
    return NextResponse.json(
      { data: null, error: toUserErrorMessage(error, APP_ERRORS.PROFILE_SAVE_FAILED) },
      { status: 500 }
    );
  }
  return NextResponse.json({ data, error: null });
}
