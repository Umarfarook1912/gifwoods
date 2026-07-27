import { ROUTES } from "@/constants/routes";

/** Only allow same-origin relative paths to prevent open redirects. */
export function sanitizeCallbackUrl(
  value: string | null | undefined,
  fallback: string = ROUTES.HOME
): string {
  if (!value) return fallback;

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) {
    return fallback;
  }

  if (decoded.startsWith(ROUTES.LOGIN) || decoded.startsWith(ROUTES.REGISTER)) {
    return fallback;
  }

  return decoded;
}

export function buildLoginHref(returnPath?: string | null): string {
  const safe = sanitizeCallbackUrl(returnPath, ROUTES.HOME);
  if (safe === ROUTES.HOME) return ROUTES.LOGIN;
  return `${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(safe)}`;
}

export function buildRegisterHref(returnPath?: string | null): string {
  const safe = sanitizeCallbackUrl(returnPath, ROUTES.HOME);
  if (safe === ROUTES.HOME) return ROUTES.REGISTER;
  return `${ROUTES.REGISTER}?callbackUrl=${encodeURIComponent(safe)}`;
}
