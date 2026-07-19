"use client";

import { useEffect, useState } from "react";
import { CreditCard, Plus, Trash2, Shield, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { SavedPaymentMethod } from "@/types/user";

export function PaymentMethods() {
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [type, setType] = useState<"card" | "upi">("card");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState(""); // MM/YY
  const [upiId, setUpiId] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const loadMethods = async () => {
    try {
      const res = await fetch("/api/profile/payment-methods");
      const { data } = await res.json();
      if (data) setMethods(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let payload: any = { method_type: type, is_default: isDefault };

    if (type === "card") {
      if (!cardHolder || !cardNumber || !expiry) {
        toast.error("Please fill in card details");
        setLoading(false);
        return;
      }
      const [mm, yy] = expiry.split("/");
      payload = {
        ...payload,
        provider: "stripe",
        last4: cardNumber.slice(-4),
        brand: cardNumber.startsWith("4") ? "Visa" : cardNumber.startsWith("5") ? "Mastercard" : "Card",
        expiry_month: parseInt(mm) || 12,
        expiry_year: parseInt(`20${yy}`) || 2030,
      };
    } else {
      if (!upiId || !upiId.includes("@")) {
        toast.error("Please enter a valid UPI ID (e.g. user@bank)");
        setLoading(false);
        return;
      }
      payload = {
        ...payload,
        provider: "razorpay",
        upi_id: upiId,
      };
    }

    try {
      const res = await fetch("/api/profile/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const { error } = await res.json();
      if (error) throw new Error(error);

      toast.success("Payment method saved securely!");
      setShowForm(false);
      setCardHolder("");
      setCardNumber("");
      setExpiry("");
      setUpiId("");
      setIsDefault(false);
      await loadMethods();
    } catch (err: any) {
      toast.error(err.message || "Failed to save payment method");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this payment method?")) return;
    try {
      const res = await fetch(`/api/profile/payment-methods/${id}`, { method: "DELETE" });
      const { error } = await res.json();
      if (error) throw new Error(error);
      toast.success("Payment method removed");
      await loadMethods();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove payment method");
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
        <h2 className="font-display text-xl font-bold text-dark">Saved Payment Methods</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-gold hover:bg-gold-dark text-dark font-semibold gap-2">
            <Plus className="w-4 h-4" /> Add Method
          </Button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-border space-y-4">
          <div className="flex gap-4 border-b border-border pb-3 mb-2">
            <button type="button" onClick={() => setType("card")} className={`pb-1 text-sm font-bold border-b-2 transition-colors ${type === "card" ? "border-gold text-gold" : "border-transparent text-warm-gray"}`}>
              Credit/Debit Card
            </button>
            <button type="button" onClick={() => setType("upi")} className={`pb-1 text-sm font-bold border-b-2 transition-colors ${type === "upi" ? "border-gold text-gold" : "border-transparent text-warm-gray"}`}>
              UPI ID
            </button>
          </div>

          {type === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="holder">Cardholder Name</Label>
                <Input id="holder" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cardNum">Card Number</Label>
                <Input id="cardNum" maxLength={16} value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))} placeholder="16-digit card number" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="exp">Expiry Date (MM/YY)</Label>
                <Input id="exp" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="12/29" />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <Label htmlFor="upi">UPI ID</Label>
              <Input id="upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="john@okhdfcbank" />
            </div>
          )}

          <div className="pt-2">
            <label className="flex items-center gap-2 text-sm text-dark cursor-pointer">
              <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded text-gold focus:ring-gold" />
              Set as Default Payment Method
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" className="bg-gold hover:bg-gold-dark text-dark font-semibold">Save Method</Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methods.map((method) => (
              <div key={method.id} className="bg-gradient-to-br from-secondary-dark to-dark text-white p-5 rounded-2xl flex flex-col justify-between h-40 shadow-md relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {method.method_type === "card" ? <CreditCard className="w-5 h-5 text-gold" /> : <Smartphone className="w-5 h-5 text-gold" />}
                    <span className="text-sm font-semibold tracking-wider uppercase">{method.method_type === "card" ? method.brand : "UPI"}</span>
                  </div>
                  {method.is_default && <Badge className="bg-gold text-dark border-transparent text-[9px] hover:bg-gold">Default</Badge>}
                </div>

                <div className="my-2">
                  {method.method_type === "card" ? (
                    <p className="font-mono text-base tracking-widest">•••• •••• •••• {method.last4}</p>
                  ) : (
                    <p className="font-mono text-sm tracking-wide truncate">{method.upi_id}</p>
                  )}
                </div>

                <div className="flex justify-between items-end">
                  {method.method_type === "card" && (
                    <div>
                      <p className="text-[10px] text-warm-gray tracking-wider uppercase">Expires</p>
                      <p className="text-xs font-mono">{method.expiry_month}/{String(method.expiry_year || 0).slice(-2)}</p>
                    </div>
                  )}
                  <button onClick={() => handleDelete(method.id)} className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-red-500 hover:text-white transition-colors" title="Remove method">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {methods.length === 0 && (
            <div className="bg-white text-center py-12 rounded-2xl border border-border">
              <p className="text-warm-gray text-sm">No saved payment tokens found.</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-warm-gray bg-cream border border-gold/10 p-3.5 rounded-xl">
            <Shield className="w-4 h-4 text-gold flex-shrink-0" />
            <span>All your payment tokens are encrypted and saved securely. We do not store raw card details or CVVs.</span>
          </div>
        </div>
      )}
    </div>
  );
}
