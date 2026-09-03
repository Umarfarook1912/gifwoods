"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Gift, ShieldCheck } from "lucide-react";
import { CheckoutAddressStep } from "@/components/features/checkout/CheckoutAddressStep";
import { CheckoutStepper } from "@/components/features/checkout/CheckoutStepper";
import { CheckoutSummary } from "@/components/features/checkout/CheckoutSummary";
import { CheckoutReview } from "@/components/features/checkout/CheckoutReview";
import { CheckoutPayment } from "@/components/features/checkout/CheckoutPayment";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/useCartStore";
import { calculateShipping } from "@/lib/orders/pricing";
import { ROUTES } from "@/constants/routes";
import { API_ENDPOINTS } from "@/constants/api";
import { CHECKOUT_COPY } from "@/constants/checkout";
import { APP_ERRORS } from "@/constants/errors";
import { toastError } from "@/lib/errors/toast";
import { toast } from "sonner";
import type { CheckoutStep, ShippingAddress } from "@/types/order";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, getSubtotal, shippingMethod, setShippingMethod } = useCartStore();
  const [step, setStep] = useState<CheckoutStep>("address");
  const [address, setAddress] = useState<ShippingAddress | null>(null);
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = getSubtotal();
  const shipping = calculateShipping(subtotal, shippingMethod);
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-cream px-4 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/15">
          <Gift className="h-8 w-8 text-gold" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-dark">Your cart is empty</h1>
          <p className="mt-1 text-sm text-warm-gray">Add a thoughtful gift before checkout.</p>
        </div>
        <Button className="rounded-full bg-gold px-8 text-dark hover:bg-gold-dark" asChild>
          <Link href={ROUTES.SHOP}>Browse Gifts</Link>
        </Button>
      </div>
    );
  }

  const handleAddressSubmit = (addr: ShippingAddress) => {
    setAddress(addr);
    setDeliveryPincode(addr.pincode);
    setStep("review");
  };

  const handlePayment = async () => {
    if (!session) {
      toast.error("Please sign in to complete checkout");
      return;
    }
    if (!address) {
      setStep("address");
      toast.error("Please add a delivery address");
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
            customization: item.customization,
          })),
          shipping_address: address,
          shipping_method: shippingMethod,
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
    } catch (e) {
      toastError(e, APP_ERRORS.PAYMENT_INIT_FAILED);
      setLoading(false);
    }
  };

  const handleStepChange = (nextStep: CheckoutStep) => {
    if (nextStep !== "address" && !address) return;
    setStep(nextStep);
  };

  return (
    <main className="min-h-screen bg-cream py-6 sm:py-10 lg:py-14">
      <div className="page-container max-w-6xl">
        <div className="mb-6 text-center sm:mb-8 sm:text-left">
          <h1 className="font-display text-3xl font-bold text-dark sm:text-4xl">
            {CHECKOUT_COPY.TITLE}
          </h1>
          <p className="mt-2 text-sm text-warm-gray sm:text-base">
            {CHECKOUT_COPY.SUBTITLE}
          </p>
        </div>

        <div className="mb-6 max-w-2xl sm:mb-8">
          <CheckoutStepper currentStep={step} onStepChange={handleStepChange} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
          <section className="order-last rounded-3xl border border-border bg-white p-4 shadow-sm sm:p-7 lg:order-first">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="font-display text-xl font-bold text-dark sm:text-2xl">
                {step === "address" && CHECKOUT_COPY.ADDRESS_TITLE}
                {step === "review" && CHECKOUT_COPY.REVIEW_TITLE}
                {step === "payment" && CHECKOUT_COPY.PAYMENT_TITLE}
              </h2>
              <span className="hidden items-center gap-1.5 text-xs text-warm-gray sm:flex">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure checkout
              </span>
            </div>

            {step === "address" && (
              <CheckoutAddressStep
                enabled={Boolean(session)}
                value={address}
                onSubmit={handleAddressSubmit}
                onPincodeChange={setDeliveryPincode}
              />
            )}
            {step === "review" && address && (
              <CheckoutReview
                address={address}
                items={items}
                onEditAddress={() => setStep("address")}
                onContinue={() => setStep("payment")}
              />
            )}
            {step === "payment" && (
              <CheckoutPayment total={total} loading={loading} onPay={handlePayment} />
            )}
          </section>

          <div className="order-first lg:order-last">
          <CheckoutSummary
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
            shippingMethod={shippingMethod}
            onShippingMethodChange={setShippingMethod}
            pincode={deliveryPincode || address?.pincode || ""}
          />
          </div>
        </div>
      </div>
    </main>
  );
}
