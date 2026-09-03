import { getAdminProfiles, getCustomerProfiles } from "@/lib/db/users";
import type { UserProfile } from "@/types/user";

export async function getAdminUserProfiles(): Promise<UserProfile[]> {
  return getAdminProfiles();
}

export async function getCustomerUserProfiles(): Promise<UserProfile[]> {
  return getCustomerProfiles();
}
