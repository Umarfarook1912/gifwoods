"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/hooks/useCartStore";
import { PAYMENT_RETURN_TOAST } from "@/constants/checkout";

interface Props {
  orderId: string;
  paymentResult?: string;
}

export function PaymentReturnNotice({ orderId, paymentResult }: Props) {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (!paymentResult) return;

    const storageKey = `${PAYMENT_RETURN_TOAST.STORAGE_KEY_PREFIX}${orderId}:${paymentResult}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) {
      return;
    }

    if (paymentResult === "success") {
      clearCart();
      toast.success(PAYMENT_RETURN_TOAST.SUCCESS, {
        description: PAYMENT_RETURN_TOAST.SUCCESS_DESCRIPTION,
        duration: PAYMENT_RETURN_TOAST.DURATION_MS,
      });
    } else if (paymentResult === "pending") {
      toast.info(PAYMENT_RETURN_TOAST.PENDING, {
        description: PAYMENT_RETURN_TOAST.PENDING_DESCRIPTION,
        duration: PAYMENT_RETURN_TOAST.DURATION_MS,
      });
    } else if (paymentResult === "verification-failed") {
      toast.error(PAYMENT_RETURN_TOAST.VERIFICATION_FAILED, {
        description: PAYMENT_RETURN_TOAST.VERIFICATION_FAILED_DESCRIPTION,
        duration: PAYMENT_RETURN_TOAST.DURATION_MS,
      });
    } else {
      return;
    }

    sessionStorage.setItem(storageKey, "1");
  }, [clearCart, orderId, paymentResult]);

  return null;
}
