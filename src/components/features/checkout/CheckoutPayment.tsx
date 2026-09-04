"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/formatters";

interface Props {
  total: number;
  loading: boolean;
  onPay: () => void;
  disabled?: boolean;
}

export function CheckoutPayment({ total, loading, onPay, disabled = false }: Props) {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Button
        className="h-12 w-full max-w-sm rounded-full bg-gold text-base font-semibold text-dark hover:bg-gold-dark"
        onClick={onPay}
        disabled={loading || disabled}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Opening secure payment…" : `Pay ${formatPrice(total)}`}
      </Button>
    </div>
  );
}
