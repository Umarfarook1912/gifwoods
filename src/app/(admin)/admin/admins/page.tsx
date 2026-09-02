import type { Metadata } from "next";
import { AdminStaffClient } from "@/components/features/admin/AdminStaffClient";
import { getAdminProfiles } from "@/lib/admin/user-profiles";

export const metadata: Metadata = { title: "Admin Management" };
export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const admins = await getAdminProfiles();
  return <AdminStaffClient initialAdmins={admins} />;
}
