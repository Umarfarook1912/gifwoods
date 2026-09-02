import { NextResponse } from "next/server";
import { toUserErrorMessage } from "@/lib/errors/user-message";

interface ErrorBody {
  data: null;
  error: string;
}

export function apiError(
  error: unknown,
  fallback: string,
  status = 500
): NextResponse<ErrorBody> {
  if (error) {
    console.error(fallback, error);
  }

  return NextResponse.json(
    { data: null, error: toUserErrorMessage(error, fallback) },
    { status }
  );
}

export function plainError(
  error: unknown,
  fallback: string,
  status = 500
): NextResponse<{ error: string }> {
  if (error) {
    console.error(fallback, error);
  }

  return NextResponse.json(
    { error: toUserErrorMessage(error, fallback) },
    { status }
  );
}
