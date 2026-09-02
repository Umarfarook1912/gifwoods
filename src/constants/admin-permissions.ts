export const ADMIN_PERMISSION_IDS = {
  DASHBOARD: "dashboard",
  PRODUCTS: "products",
  CATEGORIES: "categories",
  ORDERS: "orders",
  ADMINS: "admins",
  CUSTOMERS: "customers",
  REVIEWS: "reviews",
} as const;

export type AdminPermissionId =
  (typeof ADMIN_PERMISSION_IDS)[keyof typeof ADMIN_PERMISSION_IDS];

const LEGACY_USERS_PERMISSION = "users";

export const ADMIN_PERMISSIONS = [
  {
    id: ADMIN_PERMISSION_IDS.DASHBOARD,
    label: "Dashboard",
    description: "Access to view KPIs, analytics and store activity charts.",
  },
  {
    id: ADMIN_PERMISSION_IDS.PRODUCTS,
    label: "Products",
    description: "Create, view, modify and delete catalog products.",
  },
  {
    id: ADMIN_PERMISSION_IDS.CATEGORIES,
    label: "Categories",
    description: "Organise products into sub-groups and taxonomies.",
  },
  {
    id: ADMIN_PERMISSION_IDS.ORDERS,
    label: "Orders",
    description: "View purchases, update fulfillment statuses, track payment status.",
  },
  {
    id: ADMIN_PERMISSION_IDS.ADMINS,
    label: "Admins",
    description: "Manage admin staff, roles, and permission assignments.",
  },
  {
    id: ADMIN_PERMISSION_IDS.CUSTOMERS,
    label: "Users",
    description: "View and manage registered customer accounts.",
  },
  {
    id: ADMIN_PERMISSION_IDS.REVIEWS,
    label: "Reviews",
    description: "Moderate, approve or delete client product testimonials.",
  },
] as const;

/** Expand legacy combined "users" permission into separate admins + customers. */
export function expandLegacyPermissions(permissions: string[]): string[] {
  if (!permissions.includes(LEGACY_USERS_PERMISSION)) {
    return permissions;
  }

  const expanded = new Set(
    permissions.filter((permission) => permission !== LEGACY_USERS_PERMISSION)
  );
  expanded.add(ADMIN_PERMISSION_IDS.ADMINS);
  expanded.add(ADMIN_PERMISSION_IDS.CUSTOMERS);
  return [...expanded];
}

export function hasAdminModuleAccess(
  permissions: string[] | undefined,
  module: string
): boolean {
  if (!permissions?.length) return false;
  return expandLegacyPermissions(permissions).includes(module);
}

/** Map an admin URL to the permission key required to access it. */
export function getAdminRoutePermission(pathname: string): string | null {
  if (pathname.startsWith("/admin/admins") || pathname.startsWith("/admin/users")) {
    return ADMIN_PERMISSION_IDS.ADMINS;
  }

  if (pathname.startsWith("/admin/customers")) {
    return ADMIN_PERMISSION_IDS.CUSTOMERS;
  }

  const moduleName = pathname.split("/")[2];
  if (!moduleName || moduleName === "403") {
    return null;
  }

  return moduleName;
}
