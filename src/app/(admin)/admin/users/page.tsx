import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function LegacyAdminUsersPage() {
  redirect(ROUTES.ADMIN.CUSTOMERS);
}
