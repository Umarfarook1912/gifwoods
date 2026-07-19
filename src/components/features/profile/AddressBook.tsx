"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, MapPin, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Address } from "@/types/user";

export function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [isShipping, setIsShipping] = useState(false);
  const [isBilling, setIsBilling] = useState(false);

  const loadAddresses = async () => {
    try {
      const res = await fetch("/api/profile/addresses");
      const { data } = await res.json();
      if (data) setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const resetForm = () => {
    setName("");
    setPhone("");
    setStreet("");
    setApartment("");
    setCity("");
    setState("");
    setZip("");
    setIsShipping(false);
    setIsBilling(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (addr: Address) => {
    setEditId(addr.id);
    setName(addr.name);
    setPhone(addr.phone);
    setStreet(addr.street_address);
    setApartment(addr.apartment || "");
    setCity(addr.city);
    setState(addr.state);
    setZip(addr.postal_code);
    setIsShipping(addr.is_default_shipping);
    setIsBilling(addr.is_default_billing);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !street || !city || !state || !zip) {
      return toast.error("Please fill in all required fields");
    }

    const payload = {
      name,
      phone,
      street_address: street,
      apartment,
      city,
      state,
      postal_code: zip,
      is_default_shipping: isShipping,
      is_default_billing: isBilling,
    };

    setLoading(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/profile/addresses/${editId}` : "/api/profile/addresses";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const { error } = await res.json();
      if (error) throw new Error(error);

      toast.success(editId ? "Address updated!" : "Address added successfully!");
      resetForm();
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || "Failed to save address");
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/profile/addresses/${id}`, { method: "DELETE" });
      const { error } = await res.json();
      if (error) throw new Error(error);
      toast.success("Address deleted");
      await loadAddresses();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete address");
    }
  };

  if (loading && !showForm) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-bold text-dark">Address Book</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-gold hover:bg-gold-dark text-dark font-semibold gap-2">
            <Plus className="w-4 h-4" /> Add Address
          </Button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-border space-y-4">
          <h3 className="font-bold text-dark text-lg mb-4">{editId ? "Edit Address" : "New Address"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="addrName">Label Name (e.g. Home, Work)</Label>
              <Input id="addrName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Home" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="addrPhone">Phone Number</Label>
              <Input id="addrPhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" required />
            </div>
            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="street">Street Address</Label>
              <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Flat, Street info" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="apartment">Apartment, Suite (Optional)</Label>
              <Input id="apartment" value={apartment} onChange={(e) => setApartment(e.target.value)} placeholder="Apt #" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="zip">ZIP / Postal Code</Label>
              <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Pincode" required />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm text-dark cursor-pointer">
              <input type="checkbox" checked={isShipping} onChange={(e) => setIsShipping(e.target.checked)} className="rounded text-gold focus:ring-gold" />
              Set as Default Shipping Address
            </label>
            <label className="flex items-center gap-2 text-sm text-dark cursor-pointer">
              <input type="checkbox" checked={isBilling} onChange={(e) => setIsBilling(e.target.checked)} className="rounded text-gold focus:ring-gold" />
              Set as Default Billing Address
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            <Button type="submit" className="bg-gold hover:bg-gold-dark text-dark font-semibold">Save Address</Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white p-5 rounded-2xl border border-border flex flex-col justify-between shadow-sm hover:border-gold/50 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold" />
                    <span className="font-bold text-dark">{addr.name}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {addr.is_default_shipping && <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20 text-[10px]">Default Shipping</Badge>}
                    {addr.is_default_billing && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px]">Default Billing</Badge>}
                  </div>
                </div>
                <p className="text-sm text-dark">{addr.street_address}{addr.apartment ? `, ${addr.apartment}` : ""}</p>
                <p className="text-sm text-warm-gray mt-1">{addr.city}, {addr.state} — {addr.postal_code}</p>
                <p className="text-xs text-muted-foreground mt-2">Phone: {addr.phone}</p>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/50">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(addr)} className="h-8 text-xs text-warm-gray hover:text-dark">
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(addr.id)} className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
          {addresses.length === 0 && (
            <div className="col-span-full bg-white text-center py-12 rounded-2xl border border-border">
              <p className="text-warm-gray text-sm">No saved addresses found. Add a new address to speed up checkout!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
