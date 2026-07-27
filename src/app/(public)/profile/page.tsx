import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/features/profile/ProfileClient";
import { ROUTES } from "@/constants/routes";
import { buildLoginHref } from "@/lib/auth/callback-url";

export const metadata: Metadata = {
  title: "My Profile | Gifwoods",
  description: "Manage your account settings, addresses, and order history.",
};

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session) {
    redirect(buildLoginHref(ROUTES.PROFILE));
  }

  return (
    <Suspense fallback={null}>
      <ProfileClient />
    </Suspense>
  );
}
