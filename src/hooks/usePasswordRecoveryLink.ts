"use client";

import { useEffect, useState } from "react";

export type RecoveryLinkState = "loading" | "ready" | "invalid";

interface RecoveryState {
  linkState: RecoveryLinkState;
  token: string | null;
}

/** Read ?token= from the URL query string. */
function parseResetToken(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

/**
 * Validates the reset token in the URL against our own API.
 * Replaces the old Supabase auth.onAuthStateChange / setSession flow.
 */
export function usePasswordRecoveryLink(): RecoveryState {
  const [linkState, setLinkState] = useState<RecoveryLinkState>("loading");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = parseResetToken();
    if (!t) {
      setLinkState("invalid");
      return;
    }

    fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(t)}`)
      .then((res) => res.json())
      .then((data: { valid: boolean }) => {
        if (data.valid) {
          setToken(t);
          setLinkState("ready");
        } else {
          setLinkState("invalid");
        }
      })
      .catch(() => {
        setLinkState("invalid");
      });
  }, []);

  return { linkState, token };
}
