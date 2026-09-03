/**
 * DB service — Password Reset Tokens
 *
 * Self-managed token system — works on Supabase today and plain Postgres later.
 * Replaces supabase.auth.admin.generateLink({ type: "recovery" }).
 *
 * TODAY:  uses Supabase client
 * LATER:  swap to pool.query() — callers stay unchanged
 */
import { createAdminClient } from "@/lib/supabase/admin";

export interface ResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
}

/** Store a new reset token (1 hour expiry). */
export async function createResetToken(
  userId: string,
  token: string
): Promise<void> {
  const supabase = createAdminClient();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  const { error } = await supabase.from("password_reset_tokens").insert({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });
  if (error) throw error;
}

/** Find a token row — returns null if not found, expired, or already used. */
export async function findValidResetToken(token: string): Promise<ResetToken | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("password_reset_tokens")
    .select("*")
    .eq("token", token)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  return (data as ResetToken) ?? null;
}

/** Mark a token as used (call after password is updated). */
export async function markTokenUsed(token: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("password_reset_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token", token);
}
