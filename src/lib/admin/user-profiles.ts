import { createAdminClient } from "@/lib/supabase/admin";
import type { UserProfile } from "@/types/user";

export async function getAdminProfiles(): Promise<UserProfile[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["admin", "super_admin"])
    .order("created_at", { ascending: false });
  return (data ?? []) as UserProfile[];
}

export async function getCustomerProfiles(): Promise<UserProfile[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "user")
    .order("created_at", { ascending: false });
  return (data ?? []) as UserProfile[];
}
