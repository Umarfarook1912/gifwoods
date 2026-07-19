"use client";

import { useState } from "react";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const { error } = await res.json();
      if (error) throw new Error(error);

      toast.success("Password changed successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-border">
      <h2 className="font-display text-xl font-bold text-dark mb-6">Security Settings</h2>

      <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="newPass">New Password</Label>
          <div className="relative">
            <Input id="newPass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPass">Confirm Password</Label>
          <div className="relative">
            <Input id="confirmPass" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required />
          </div>
        </div>

        <div className="pt-2 flex justify-start">
          <Button type="submit" disabled={loading} className="bg-gold hover:bg-gold-dark text-dark font-semibold gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-border flex items-start gap-3 text-xs text-warm-gray">
        <ShieldCheck className="w-5 h-5 text-gold flex-shrink-0" />
        <div className="space-y-1">
          <p className="font-bold text-dark">Account Protection</p>
          <p>Changing your password will update your auth details. Make sure you use a strong, unique password to prevent unauthorized access.</p>
        </div>
      </div>
    </div>
  );
}
