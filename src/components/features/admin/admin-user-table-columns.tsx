"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils/formatters";
import { ADMIN_TABLE } from "@/constants/admin-ui";
import type { UserProfile } from "@/types/user";
import type { Session } from "next-auth";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

function UserCell({ user }: { user: UserProfile }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={user.avatar_url ?? undefined} />
        <AvatarFallback className="bg-gold/10 text-gold text-xs">
          {user.name?.slice(0, 2).toUpperCase() ?? "??"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium text-dark truncate">{user.name ?? "—"}</p>
        <p className="text-xs text-warm-gray truncate">{user.email}</p>
      </div>
    </div>
  );
}

interface StaffColumnOptions {
  session: Session | null;
  isSuperAdmin: boolean;
  router: AppRouterInstance;
  onDelete: (user: UserProfile) => void;
}

export function buildStaffColumns({
  session,
  isSuperAdmin,
  router,
  onDelete,
}: StaffColumnOptions) {
  return [
    {
      key: "user",
      label: "User",
      className: ADMIN_TABLE.userCell,
      render: (u: UserProfile) => <UserCell user={u} />,
    },
    {
      key: "role",
      label: "Role",
      className: ADMIN_TABLE.compact,
      render: (u: UserProfile) => (
        <Badge
          className={
            u.role === "super_admin"
              ? "bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold"
              : "bg-gold/10 text-gold border-gold/30 font-semibold"
          }
        >
          {u.role === "super_admin" ? "Super Admin" : "Admin"}
        </Badge>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      className: `${ADMIN_TABLE.compact} text-warm-gray`,
      render: (u: UserProfile) => <span>{u.phone ?? "—"}</span>,
    },
    {
      key: "created_at",
      label: "Joined",
      className: `${ADMIN_TABLE.compact} text-warm-gray`,
      render: (u: UserProfile) => (
        <span className="text-xs">{formatDate(u.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (u: UserProfile) => {
        const isSelf = u.id === session?.user?.id;
        return (
          <div className="flex items-center justify-end gap-1">
            {isSuperAdmin && u.role === "admin" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-xs text-gold hover:text-gold-dark hover:bg-gold/10 font-semibold"
                  onClick={() => router.push(`/admin/users/${u.id}/edit`)}
                >
                  Edit
                </Button>
                {!isSelf && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 font-semibold"
                    onClick={() => onDelete(u)}
                  >
                    Delete
                  </Button>
                )}
              </>
            )}
            {!isSuperAdmin && u.role === "admin" && (
              <span className="text-xs text-warm-gray">—</span>
            )}
            {u.role === "super_admin" && (
              <span className="text-xs text-amber-500 font-medium">—</span>
            )}
          </div>
        );
      },
    },
  ];
}

interface CustomerColumnOptions {
  isSuperAdmin: boolean;
  router: AppRouterInstance;
  onDelete: (user: UserProfile) => void;
}

export function buildCustomerColumns({
  isSuperAdmin,
  router,
  onDelete,
}: CustomerColumnOptions) {
  return [
    {
      key: "user",
      label: "User",
      className: ADMIN_TABLE.userCell,
      render: (u: UserProfile) => <UserCell user={u} />,
    },
    {
      key: "phone",
      label: "Phone",
      className: `${ADMIN_TABLE.compact} text-warm-gray`,
      render: (u: UserProfile) => <span>{u.phone ?? "—"}</span>,
    },
    {
      key: "created_at",
      label: "Joined",
      className: `${ADMIN_TABLE.compact} text-warm-gray`,
      render: (u: UserProfile) => (
        <span className="text-xs">{formatDate(u.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (u: UserProfile) =>
        isSuperAdmin ? (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs text-gold hover:text-gold-dark hover:bg-gold/10 font-semibold"
              onClick={() => router.push(`/admin/users/create?promoteId=${u.id}`)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 font-semibold"
              onClick={() => onDelete(u)}
            >
              Delete
            </Button>
          </div>
        ) : (
          <span className="text-xs text-warm-gray">—</span>
        ),
    },
  ];
}
