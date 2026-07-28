"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

const AVAILABLE_PERMISSIONS = [
  { id: "dashboard", label: "Dashboard", description: "Access to view KPIs, analytics and store activity charts." },
  { id: "products", label: "Products", description: "Create, view, modify and delete catalog products." },
  { id: "categories", label: "Categories", description: "Organise products into sub-groups and taxonomies." },
  { id: "orders", label: "Orders", description: "View purchases, update fulfillment statuses, track payment status." },
  { id: "users", label: "Users & Admins", description: "Manage database profiles and assign admin credentials." },
  { id: "reviews", label: "Reviews", description: "Moderate, approve or delete client product testimonials." },
  { id: "customers", label: "Customers", description: "Manage customer profiles, purchase history and feedback." },
  { id: "brands", label: "Brands", description: "Add, modify and associate product branding." },
  { id: "coupons", label: "Coupons", description: "Create marketing promotional discounts and rules." },
  { id: "inventory", label: "Inventory", description: "Manage stock levels, warehouses and replenish inventory." },
  { id: "reports", label: "Reports", description: "Export financial statements, audit logs and customer reports." },
  { id: "settings", label: "Settings", description: "Modify global store metadata, SEO and contact info." },
  { id: "notifications", label: "Notifications", description: "Manage email triggers and push alerts." },
  { id: "banners", label: "Banners & Promos", description: "Customise home hero layouts and discount sliders." },
  { id: "blogs", label: "Blogs & Editorial", description: "Write and update storefront news posts." },
];

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function CreateAdminPage({ searchParams }: Props) {
  const router = useRouter();
  const searchParamsResolved = use(searchParams);
  const promoteId = searchParamsResolved.promoteId as string | undefined;
  
  const { data: session, status } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accStatus, setAccStatus] = useState<"active" | "inactive">("active");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);

  // Pre-fill if promoting existing user
  useEffect(() => {
    if (!promoteId) return;
    
    setFetchingUser(true);
    fetch(`/api/users/${promoteId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setName(json.data.name || "");
          setEmail(json.data.email || "");
          toast.info(`Promoting user ${json.data.name || json.data.email} to Admin`);
        }
      })
      .catch(() => toast.error("Failed to load user details for promotion."))
      .finally(() => setFetchingUser(false));
  }, [promoteId]);

  if (status === "loading" || fetchingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    );
  }

  // Redirect if not Super Admin
  if (!session || session.user.role !== "super_admin") {
    router.replace("/admin/403");
    return null;
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, id]);
    } else {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== id));
    }
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === AVAILABLE_PERMISSIONS.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(AVAILABLE_PERMISSIONS.map((p) => p.id));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Name is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!password) return toast.error("Password is required");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          permissions: selectedPermissions,
          status: accStatus,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Admin account created successfully.");
        router.push("/admin/users");
      } else {
        toast.error(json.error || "Failed to create Admin account.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold text-dark">Create Admin</h1>
          <p className="text-sm text-warm-gray">Register a new Administrator and configure their access permissions.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-white rounded-2xl border border-border p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!promoteId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Account Status</Label>
            <Select value={accStatus} onValueChange={(val: any) => setAccStatus(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value="Admin" disabled className="bg-muted" />
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-semibold text-lg text-dark flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold-dark" />
                Menu Permissions
              </h2>
              <p className="text-xs text-warm-gray">Select which menus and modules this administrator is allowed to access.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs font-semibold"
            >
              {selectedPermissions.length === AVAILABLE_PERMISSIONS.length ? "Deselect All" : "Select All"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AVAILABLE_PERMISSIONS.map((perm) => {
              const isChecked = selectedPermissions.includes(perm.id);
              return (
                <div
                  key={perm.id}
                  onClick={() => handleCheckboxChange(perm.id, !isChecked)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? "border-gold/50 bg-gold/5"
                      : "border-border hover:border-gold/30 bg-white"
                  }`}
                >
                  <Checkbox
                    id={`perm-${perm.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheckboxChange(perm.id, !!checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <Label
                      htmlFor={`perm-${perm.id}`}
                      className="font-semibold text-sm cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {perm.label}
                    </Label>
                    <p className="text-xs text-warm-gray leading-normal">{perm.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" asChild disabled={saving}>
            <Link href="/admin/users">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving} className="bg-dark text-white hover:bg-secondary-dark font-semibold">
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
            ) : (
              "Save Admin Account"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
