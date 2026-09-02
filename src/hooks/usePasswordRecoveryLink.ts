"use client";

import { useEffect, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/client";

export type RecoveryLinkState = "loading" | "ready" | "invalid";

interface RecoveryState {
  linkState: RecoveryLinkState;
  email: string | null;
}

function parseRecoveryTokens(): {
  accessToken: string;
  refreshToken: string;
} | null {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(hash);
  const type = params.get("type");
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (type !== "recovery" || !accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

async function readRecoveryEmail(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

export function usePasswordRecoveryLink(): RecoveryState {
  const [linkState, setLinkState] = useState<RecoveryLinkState>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let resolved = false;

    const resolveReady = () => {
      if (resolved) return;
      resolved = true;
      void readRecoveryEmail().then(setEmail);
      setLinkState("ready");
    };

    const resolveInvalid = () => {
      if (resolved) return;
      resolved = true;
      setLinkState("invalid");
    };

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        resolveReady();
      }
    });

    const tokens = parseRecoveryTokens();
    if (tokens) {
      void supabase.auth
        .setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        })
        .then(({ error }) => {
          if (error) {
            console.error("Reset password: setSession failed", error);
            resolveInvalid();
            return;
          }
          resolveReady();
          window.history.replaceState(null, "", ROUTES.RESET_PASSWORD);
        });
    } else {
      const timeout = window.setTimeout(() => {
        void supabase.auth.getSession().then(({ data }) => {
          if (data.session) {
            resolveReady();
          } else {
            resolveInvalid();
          }
        });
      }, 1500);

      return () => {
        window.clearTimeout(timeout);
        subscription.subscription.unsubscribe();
      };
    }

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { linkState, email };
}
