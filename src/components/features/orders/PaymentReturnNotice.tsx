"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/hooks/useCartStore";

interface Props {
  paymentResult?: string;
}

export function PaymentReturnNotice({ paymentResult }: Props) {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (paymentResult === "success") {
      clearCart();
      toast.success("Payment successful. Your order is confirmed!");
    } else if (paymentResult === "pending") {
      toast.info("Payment is still processing. The order status will update shortly.");
    } else if (paymentResult === "verification-failed") {
      toast.error("We could not verify the payment yet. Please check again shortly.");
    }
  }, [clearCart, paymentResult]);

  return null;
}
