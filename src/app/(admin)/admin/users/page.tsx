import type { Metadata } from "next";
import { AdminUsersClient } from "@/components/features/admin/AdminUsersClient";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserProfile } from "@/types/user";

export const metadata: Metadata = { title: "User Management" };

async function getUsers(): Promise<UserProfile[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as UserProfile[];
}

export default async function AdminUsersPage() {
  const users = await getUsers();
  return <AdminUsersClient initialUsers={users} />;
}
