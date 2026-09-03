/**
 * Auth user-service — wraps all Supabase Auth Admin API calls.
 *
 * TODAY:  every function calls Supabase Auth Admin API internally.
 * LATER:  swap each function body to use pg pool + bcryptjs.
 *         Callers (auth.ts, register, admin user routes) never change.
 *
 * Auth functions return minimal data; profile/role data lives in
 * src/lib/db/users.ts (profiles table).
 */
import { createAdminClient } from "@/lib/supabase/admin";

export interface AuthUserResult {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * Verify email + password against Supabase Auth.
 * Returns the auth user on success, null on failure.
 *
 * LATER: SELECT id, email, password_hash FROM users WHERE email = $1
 *        → bcryptjs.compare(password, password_hash)
 */
export async function verifyPassword(
  email: string,
  password: string
): Promise<AuthUserResult | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? email,
    name: data.user.user_metadata?.name ?? null,
    image: data.user.user_metadata?.avatar_url ?? null,
  };
}

// ── Create / Delete ───────────────────────────────────────────────────────────

/**
 * Create a new Auth user (for register and admin-create-user flows).
 * Returns the new user's UUID.
 *
 * LATER: INSERT INTO users(id, email, password_hash) VALUES (gen_random_uuid(), $1, bcrypt.hash($2))
 */
export async function createAuthUser(
  email: string,
  password: string,
  meta?: { name?: string }
): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta ?? {},
  });
  if (error) throw error;
  if (!data.user) throw new Error("Auth user creation returned no user");
  return data.user.id;
}

/**
 * Delete an Auth user (cascades to profiles via FK).
 *
 * LATER: DELETE FROM users WHERE id = $1
 */
export async function deleteAuthUser(userId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
}

// ── Password ──────────────────────────────────────────────────────────────────

/**
 * Update a user's password via the Auth Admin API.
 *
 * LATER: UPDATE users SET password_hash = bcrypt.hash($2) WHERE id = $1
 */
export async function updateAuthPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  if (error) throw error;
}

/**
 * Update Auth user metadata (name).
 *
 * LATER: no-op or UPDATE users SET name = $2 WHERE id = $1
 *        (name is stored in profiles too, so this becomes optional)
 */
export async function updateAuthMeta(
  userId: string,
  meta: { name?: string }
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.auth.admin.updateUserById(userId, { user_metadata: meta });
}

// ── Google OAuth helpers ──────────────────────────────────────────────────────

/**
 * Check if a user is Google-only (no password set).
 * Used to gate forgot-password flow.
 *
 * LATER: SELECT password_hash FROM users WHERE id = $1 → IS NULL means Google-only
 */
export async function isGoogleOnlyUser(userId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data.user) return false;
  const identities = data.user.identities ?? [];
  if (!identities.length) return false;
  return identities.every((i) => i.provider === "google");
}

/**
 * Create or find a Supabase Auth user for Google sign-in.
 * Falls back to generateLink if createUser returns a duplicate.
 * Returns the user's UUID.
 *
 * LATER: INSERT INTO users(id, email, password_hash) VALUES (gen_random_uuid(), $1, NULL)
 *        ON CONFLICT (email) DO NOTHING
 *        RETURNING id
 */
export async function upsertGoogleAuthUser(
  email: string,
  meta?: { name?: string | null; avatar_url?: string | null }
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      name: meta?.name,
      full_name: meta?.name,
      avatar_url: meta?.avatar_url,
    },
  });

  if (created?.user?.id) return created.user.id;

  // Duplicate email — look up existing via generateLink
  const { data: linkData } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (createError) {
    console.error("Google upsertGoogleAuthUser createUser:", createError.message);
  }

  return linkData?.user?.id ?? null;
}
