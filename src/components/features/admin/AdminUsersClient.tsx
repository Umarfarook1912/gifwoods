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
import { toast } from "sonner";
import { Search, Shield, ShieldOff, RefreshCw } from "lucide-react";
import type { UserProfile, UserRole } from "@/types/user";

interface Props {
  initialUsers: UserProfile[];
}

export function AdminUsersClient({ initialUsers }: Props) {
  const confirm = useConfirm();
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { setUsers(initialUsers); }, [initialUsers]);

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

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-dark">Users</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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
            <Badge className={u.role === "admin" ? "bg-gold/10 text-gold border-gold/30" : "bg-muted text-muted-foreground border-border"}>
              {u.role}
            </Badge>
          )},
          { key: "phone", label: "Phone", render: (u) => <span className="text-sm text-warm-gray">{u.phone ?? "—"}</span> },
          { key: "created_at", label: "Joined", render: (u) => <span className="text-xs text-warm-gray">{formatDate(u.created_at)}</span> },
          { key: "actions", label: "", render: (u) => (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => toggleRole(u)}
              title={u.role === "admin" ? "Remove admin" : "Make admin"}
            >
              {u.role === "admin" ? <ShieldOff className="h-3.5 w-3.5 mr-1" /> : <Shield className="h-3.5 w-3.5 mr-1" />}
              {u.role === "admin" ? "Revoke" : "Make Admin"}
            </Button>
          )},
        ]}
        data={filtered}
        keyExtractor={(u) => u.id}
        total={filtered.length}
        emptyMessage="No users found"
      />
    </div>
  );
}
