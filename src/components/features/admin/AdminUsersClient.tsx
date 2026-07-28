"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "./DataTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils/formatters";
import { API_ENDPOINTS } from "@/constants/api";
import { userRoleChangeConfirmation } from "@/constants/confirmations";
import { useConfirm } from "@/hooks/useConfirm";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Search, Shield, ShieldOff, RefreshCw, Plus } from "lucide-react";
import type { UserProfile, UserRole } from "@/types/user";

interface Props {
  initialUsers: UserProfile[];
}

export function AdminUsersClient({ initialUsers }: Props) {
  const confirm = useConfirm();
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const isSuperAdmin = session?.user?.role === "super_admin";

  useEffect(() => { setUsers(initialUsers); }, [initialUsers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!u.email.toLowerCase().includes(q) && !u.name?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [users, search, roleFilter]);

  const paginated = useMemo(() => {
    const limit = 15;
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page]);

  const toggleRole = async (user: UserProfile) => {
    const newRole: UserRole = user.role === "admin" ? "user" : "admin";
    if (!(await confirm(userRoleChangeConfirmation(user.name ?? user.email, newRole)))) return;
    const res = await fetch(API_ENDPOINTS.USER_ROLE(user.id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers(users.map((u2) => u2.id === user.id ? { ...u2, role: newRole } : u2));
      toast.success(`Role updated to ${newRole}`);
    } else {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!(await confirm({
      title: "Delete Account",
      description: `Are you sure you want to permanently delete the account for ${user.name || user.email}? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "destructive"
    }))) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== user.id));
        toast.success("User deleted successfully.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete user.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-dark">Users</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {isSuperAdmin && (
            <Button size="sm" onClick={() => router.push("/admin/users/create")} className="bg-gold text-dark hover:bg-gold-dark font-semibold gap-2">
              <Plus className="h-4 w-4" />
              Create Admin
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={(v) => v && setRoleFilter(v)}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={[
          { key: "user", label: "User", render: (u) => (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={u.avatar_url ?? undefined} />
                <AvatarFallback className="bg-gold/10 text-gold text-xs">
                  {u.name?.slice(0, 2).toUpperCase() ?? "??"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{u.name ?? "—"}</p>
                <p className="text-xs text-warm-gray">{u.email}</p>
              </div>
            </div>
          )},
          { key: "role", label: "Role", render: (u) => (
            <Badge className={
              u.role === "super_admin" 
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold"
                : u.role === "admin" 
                ? "bg-gold/10 text-gold border-gold/30 font-semibold" 
                : "bg-muted text-muted-foreground border-border"
            }>
              {u.role === "super_admin" ? "Super Admin" : u.role}
            </Badge>
          )},
          { key: "phone", label: "Phone", render: (u) => <span className="text-sm text-warm-gray">{u.phone ?? "—"}</span> },
          { key: "created_at", label: "Joined", render: (u) => <span className="text-xs text-warm-gray">{formatDate(u.created_at)}</span> },
          { key: "actions", label: "", render: (u) => {
            const isSelf = u.id === session?.user?.id;
            return (
              <div className="flex items-center gap-2 justify-end">
                {isSuperAdmin && (
                  <>
                    {u.role === "admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-gold hover:text-gold-dark hover:bg-gold/10 font-semibold"
                        onClick={() => router.push(`/admin/users/${u.id}/edit`)}
                      >
                        Edit
                      </Button>
                    )}
                    {u.role === "user" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-gold hover:text-gold-dark hover:bg-gold/10 font-semibold"
                        onClick={() => router.push(`/admin/users/create?promoteId=${u.id}`)}
                      >
                        Make Admin
                      </Button>
                    )}
                    {!isSelf && (u.role === "admin" || u.role === "user") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:bg-destructive/10 font-semibold"
                        onClick={() => handleDeleteUser(u)}
                      >
                        Delete
                      </Button>
                    )}
                  </>
                )}
                {!isSuperAdmin && u.role === "admin" && (
                  <span className="text-xs text-warm-gray font-medium">Admin</span>
                )}
                {u.role === "super_admin" && (
                  <span className="text-xs text-amber-500 font-medium">Super Admin</span>
                )}
              </div>
            );
          }},
        ]}
        data={paginated}
        keyExtractor={(u) => u.id}
        total={filtered.length}
        page={page}
        limit={15}
        onPageChange={setPage}
        emptyMessage="No users found"
      />
    </div>
  );
}
