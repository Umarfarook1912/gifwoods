"use client";

import { useState } from "react";
import { Calendar, Loader2, MapPin, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DELIVERY_COPY } from "@/constants/shipping";
import { useDeliveryEstimate } from "@/hooks/useDeliveryEstimate";
import type { Product } from "@/types/product";

interface Props {
  product: Pick<Product, "customization_text" | "customization_image" | "price">;
}

export function DeliveryEstimate({ product }: Props) {
  const [pincode, setPincode] = useState("");
  const { data, isFetching, error } = useDeliveryEstimate(pincode, product);

  const digitsOnly = pincode.replace(/\D/g, "").slice(0, 6);

  function handlePincodeChange(value: string) {
    setPincode(value.replace(/\D/g, "").slice(0, 6));
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-cream/50 px-4 py-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15">
          <Truck className="h-4 w-4 text-gold" />
        </span>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">
              {DELIVERY_COPY.EXPECTED_DELIVERY_BY}
            </p>
            <p className="mt-1 text-xs text-warm-gray">
              {DELIVERY_COPY.ENTER_PINCODE}
            </p>
          </div>

          <div>
            <Label htmlFor="delivery-pincode" className="text-xs text-dark">
              {DELIVERY_COPY.PINCODE_LABEL}
            </Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
              <Input
                id="delivery-pincode"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder={DELIVERY_COPY.PINCODE_PLACEHOLDER}
                value={digitsOnly}
                onChange={(event) => handlePincodeChange(event.target.value)}
                className="pl-9"
                maxLength={6}
              />
            </div>
          </div>

          {digitsOnly.length > 0 && digitsOnly.length < 6 && (
            <p className="text-xs text-warm-gray">{DELIVERY_COPY.INVALID_PINCODE}</p>
          )}

          {digitsOnly.length === 6 && isFetching && (
            <p className="flex items-center gap-2 text-sm text-warm-gray">
              <Loader2 className="h-4 w-4 animate-spin text-gold" />
              {DELIVERY_COPY.CHECKING}
            </p>
          )}

          {digitsOnly.length === 6 && error && (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : DELIVERY_COPY.NOT_SERVICEABLE}
            </p>
          )}

          {digitsOnly.length === 6 && data?.serviceable && (
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-dark">
                <Calendar className="h-3.5 w-3.5 text-gold" />
                {data.formattedDate}
              </p>
              <p className="mt-1 text-xs text-warm-gray">
                {DELIVERY_COPY.SHIPROCKET_SOURCE}
              </p>
            </div>
          )}

          {digitsOnly.length === 6 && data && !data.serviceable && !isFetching && (
            <p className="text-sm text-destructive">{DELIVERY_COPY.NOT_SERVICEABLE}</p>
          )}
        </div>
      </div>
    </div>
  );
}
