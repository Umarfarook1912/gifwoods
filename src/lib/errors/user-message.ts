import { APP_ERRORS } from "@/constants/errors";
import { SHIPROCKET_ERRORS } from "@/constants/shipping";

const TECHNICAL_PATTERNS = [
  /\{[\s\S]*\}/,
  /\[[\s\S]*\]/,
  /^Shiprocket/i,
  /^Supabase/i,
  /postgres/i,
  /violates foreign key/i,
  /duplicate key value/i,
  /PGRST/i,
  /JWT/i,
  /status_code/i,
  /API error \[/i,
  /Response:/i,
  /awb_assign/i,
  /Unexpected token/i,
  /SyntaxError/i,
  /TypeError/i,
  /ECONNREFUSED/i,
  /fetch failed/i,
];

function extractMessage(error: unknown): string {
  if (typeof error === "string") return error.trim();
  if (error instanceof Error) return error.message.trim();
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message.trim();
  }
  return "";
}

function isTechnicalMessage(message: string): boolean {
  if (!message) return true;
  if (message.length > 180) return true;
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(message));
}

function isWalletRechargeIssue(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("wallet") && lower.includes("recharge");
}

function isDuplicateEmailIssue(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    (lower.includes("already") ||
      lower.includes("duplicate") ||
      lower.includes("exists")) &&
    lower.includes("email")
  );
}

function mapKnownMessage(message: string): string | null {
  if (isWalletRechargeIssue(message)) return SHIPROCKET_ERRORS.WALLET_RECHARGE;
  if (isDuplicateEmailIssue(message)) return APP_ERRORS.EMAIL_EXISTS;

  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  if (lower.includes("password") && lower.includes("at least")) {
    return "Password must be at least 6 characters.";
  }
  if (lower.includes("sign in") || lower.includes("unauthorized")) {
    return APP_ERRORS.UNAUTHORIZED;
  }
  if (lower.includes("not found")) {
    return APP_ERRORS.NOT_FOUND;
  }

  return null;
}

/** Convert any error into a safe, user-facing message. */
export function toUserErrorMessage(error: unknown, fallback: string): string {
  const raw = extractMessage(error);
  if (!raw) return fallback;

  const known = mapKnownMessage(raw);
  if (known) return known;

  if (!isTechnicalMessage(raw)) return raw;

  return fallback;
}

export function mapAuthErrorMessage(
  message: string,
  fallback = APP_ERRORS.REGISTRATION_FAILED
): string {
  if (isDuplicateEmailIssue(message)) return APP_ERRORS.EMAIL_EXISTS;
  return toUserErrorMessage(message, fallback);
}
