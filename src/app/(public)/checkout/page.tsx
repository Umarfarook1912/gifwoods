"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Check, MapPin, CreditCard } from "lucide-react";
import { AddressForm } from "@/components/features/checkout/AddressForm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/hooks/useCartStore";
import { formatPrice } from "@/lib/utils/formatters";
import { ROUTES } from "@/constants/routes";
import { API_ENDPOINTS } from "@/constants/api";
import { MIN_ORDER_FOR_FREE_WRAP } from "@/constants/ui";
import { toast } from "sonner";
import type { ShippingAddress } from "@/types/order";

type Step = "address" | "review" | "payment";

const STEPS: { id: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "address", label: "Address", icon: MapPin },
  { id: "review", label: "Review", icon: Check },
  { id: "payment", label: "Payment", icon: CreditCard },
];

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState<ShippingAddress | null>(null);
  const [loading, setLoading] = useState(false);

  const subtotal = getSubtotal();
  const shipping = subtotal >= MIN_ORDER_FOR_FREE_WRAP ? 0 : 99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-warm-gray">Your cart is empty.</p>
        <Button className="bg-gold text-dark hover:bg-gold-dark" asChild>
          <Link href={ROUTES.SHOP}>Browse Gifts</Link>
        </Button>
      </div>
    );
  }

  const handleAddressSubmit = (addr: ShippingAddress) => {
    setAddress(addr);
    setStep("review");
  };

  const handlePayment = async () => {
    if (!session) {
      toast.error("Please sign in to complete checkout");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.PAYMENT_CASHFREE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.product.price,
            customization: item.customization,
          })),
          shipping_address: address,
          subtotal,
          shipping_cost: shipping,
          total,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Payment initiation failed");

      const { payment_session_id } = json.data;

      // Load Cashfree SDK and open checkout
      const { load } = await import("@cashfreepayments/cashfree-js");
      const cashfree = await load({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === "PROD" ? "production" : "sandbox" });
      
      cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
      });

      clearCart();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-display text-3xl font-bold text-dark mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-8">
          {STEPS.map((s, i) => {
            const stepOrder: Step[] = ["address", "review", "payment"];
            const currentIdx = stepOrder.indexOf(step);
            const stepIdx = stepOrder.indexOf(s.id);
            const done = stepIdx < currentIdx;
            const active = s.id === step;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  done ? "bg-emerald-500 text-white" : active ? "bg-gold text-dark" : "bg-muted text-muted-foreground"
                }`}>
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${active ? "text-dark" : "text-warm-gray"}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <Separator className="w-8 hidden sm:block" />}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-border">
              {step === "address" && (
                <>
                  <h2 className="font-display font-bold text-xl text-dark mb-6">Delivery Address</h2>
                  <AddressForm onSubmit={handleAddressSubmit} />
                </>
              )}

              {step === "review" && address && (
                <>
                  <h2 className="font-display font-bold text-xl text-dark mb-4">Review Order</h2>
                  <div className="p-4 bg-cream rounded-xl border border-border mb-6">
                    <p className="font-semibold text-dark text-sm">{address.name}</p>
                    <p className="text-sm text-warm-gray mt-1">
                      {address.line1}{address.line2 ? `, ${address.line2}` : ""},{" "}
                      {address.city}, {address.state} — {address.pincode}
                    </p>
                    <p className="text-sm text-warm-gray">{address.phone}</p>
                  </div>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-dark">{item.product.name} × {item.quantity}</span>
                        <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep("address")} className="flex-1">
                      Edit Address
                    </Button>
                    <Button
                      className="flex-1 bg-gold text-dark hover:bg-gold-dark font-semibold"
                      onClick={() => setStep("payment")}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </>
              )}

              {step === "payment" && (
                <>
                  <h2 className="font-display font-bold text-xl text-dark mb-4">Payment</h2>
                  <p className="text-warm-gray text-sm mb-6">
                    Secure payment powered by Cashfree. Pay using UPI, card, netbanking, or wallet.
                  </p>
                  <div className="grid grid-cols-4 gap-2 mb-8">
                    {["UPI", "Visa", "MC", "Amex"].map((method) => (
                      <div key={method} className="border border-border rounded-lg p-2 text-center text-xs font-semibold text-warm-gray">
                        {method}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep("review")} className="flex-1">
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-gold text-dark hover:bg-gold-dark font-semibold"
                      onClick={handlePayment}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : `Pay ${formatPrice(total)}`}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-6 border border-border h-fit sticky top-24">
            <h3 className="font-display font-bold text-lg text-dark mb-4">Summary</h3>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-warm-gray">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-gray">Shipping</span>
                <span>{shipping === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(shipping)}</span>
              </div>
            </div>
            <Separator className="mb-4" />
            <div className="flex justify-between font-bold text-dark">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
