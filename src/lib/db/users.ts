/**
 * DB service — Users / Profiles
 *
 * TODAY:  wraps Supabase PostgREST queries
 * LATER:  swap internals to pool.query() — callers stay unchanged
 *
 * Covers: profile CRUD, admin user listings, dashboard counts.
 * Auth identity (password verification, createUser, deleteUser) lives
 * in @/lib/auth/user-service.ts.
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserProfile } from "@/types/user";

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getUserProfileById(id: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
  return (data as UserProfile) ?? null;
}

export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, name, status, email, role, permissions, avatar_url, phone, created_at, updated_at")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  return (data as UserProfile) ?? null;
}

/** Profiles for admin/super_admin users (admin staff list). */
export async function getAdminProfiles(): Promise<UserProfile[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["admin", "super_admin"])
    .order("created_at", { ascending: false });
  return (data ?? []) as UserProfile[];
}

/** Profiles for regular customers. */
export async function getCustomerProfiles(): Promise<UserProfile[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "user")
    .order("created_at", { ascending: false });
  return (data ?? []) as UserProfile[];
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function updateUserProfile(
  id: string,
  payload: Partial<Omit<UserProfile, "id" | "created_at" | "updated_at">>
): Promise<UserProfile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as UserProfile;
}

/** Upsert a profile row — used after Auth user creation. */
export async function upsertUserProfile(payload: {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar_url?: string | null;
  permissions?: string[];
  status?: string;
}): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id", ignoreDuplicates: false });
  if (error) throw error;
}

/** Update the profile role (super_admin only). */
export async function updateUserRole(
  id: string,
  role: string
): Promise<UserProfile> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as UserProfile;
}

/** Update profile fields from admin panel (name, status, permissions, role). */
export async function adminUpdateUserProfile(
  id: string,
  payload: { name?: string; status?: string; permissions?: string[]; role?: string }
): Promise<UserProfile> {
  const supabase = createAdminClient();
  const update: Record<string, unknown> = {};
  if (payload.name) update.name = payload.name.trim();
  if (payload.status) update.status = payload.status;
  if (payload.permissions) update.permissions = payload.permissions;
  if (payload.role) update.role = payload.role;

  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as UserProfile;
}
