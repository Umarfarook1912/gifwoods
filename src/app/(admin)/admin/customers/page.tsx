import type { Metadata } from "next";
import { AdminCustomersClient } from "@/components/features/admin/AdminCustomersClient";
import { getCustomerProfiles } from "@/lib/admin/user-profiles";

export const metadata: Metadata = { title: "User Management" };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getCustomerProfiles();
  return <AdminCustomersClient initialCustomers={customers} />;
}
