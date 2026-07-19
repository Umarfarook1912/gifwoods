"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Camera, Loader2, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PhoneNumberField } from "./PhoneNumberField";

export function AccountInfo() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image || "");

  // Load existing details from API
  useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.id) return;
      try {
        const userId = session.user.supabaseId || session.user.id;
        const res = await fetch(`/api/users/${userId}`);
        const { data } = await res.json();
        if (data) {
          if (data.name) setName(data.name);
          if (data.phone) setPhone(data.phone);
          if (data.avatar_url) setAvatarUrl(data.avatar_url);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }
    loadProfile();
  }, [session?.user?.id, session?.user?.supabaseId]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadResult = await uploadRes.json();
      if (uploadResult.error) throw new Error(uploadResult.error);

      const newAvatarUrl = uploadResult.data.url;
      setAvatarUrl(newAvatarUrl);

      // Save immediately to profile
      const userId = session?.user?.supabaseId || session?.user?.id;
      const patchRes = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: newAvatarUrl }),
      });
      const patchResult = await patchRes.json();
      if (patchResult.error) throw new Error(patchResult.error);

      await update({ image: newAvatarUrl });
      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");

    setLoading(true);
    try {
      const userId = session?.user?.supabaseId || session?.user?.id;
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const { error } = await res.json();
      if (error) throw new Error(error);

      await update({ name });
      toast.success("Profile details updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const initials = name ? name.slice(0, 2).toUpperCase() : "GW";

  return (
    <div className="bg-white p-6 rounded-2xl border border-border">
      <h2 className="font-display text-xl font-bold text-dark mb-6">Account Information</h2>
      
      <div className="flex flex-col sm:flex-row gap-8 items-center mb-8">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-gold/20">
            <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
            <AvatarFallback className="bg-gold text-dark text-xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <label className="absolute bottom-0 right-0 p-2 bg-gold text-dark rounded-full cursor-pointer hover:bg-gold-light transition-colors shadow-md">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
          </label>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="font-bold text-dark text-lg">{name || "User"}</h3>
          <p className="text-sm text-warm-gray mt-1">{session?.user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={session?.user?.email || ""} disabled className="bg-muted text-muted-foreground" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="phone">Phone Number</Label>
            <PhoneNumberField
              value={phone}
              onChange={setPhone}
              disabled={loading}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={loading} className="bg-gold hover:bg-gold-dark text-dark font-semibold gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
