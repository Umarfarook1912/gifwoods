import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/features/profile/ProfileClient";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "My Profile | Gifwoods",
  description: "Manage your account settings, addresses, payment methods, and check order history.",
};

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session) {
    redirect(`${ROUTES.LOGIN}?callbackUrl=/profile`);
  }

  return <ProfileClient />;
}
