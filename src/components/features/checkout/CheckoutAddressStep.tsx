"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, MapPin, Plus } from "lucide-react";
import { AddressForm } from "./AddressForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSavedAddresses } from "@/hooks/useSavedAddresses";
import { cn } from "@/lib/utils/cn";
import type { ShippingAddress } from "@/types/order";
import type { Address } from "@/types/user";

function toShippingAddress(address: Address): ShippingAddress {
  return {
    name: address.name,
    phone: address.phone,
    line1: address.street_address,
    line2: address.apartment ?? undefined,
    city: address.city,
    state: address.state,
    pincode: address.postal_code,
    country: address.country,
  };
}

interface Props {
  enabled: boolean;
  value: ShippingAddress | null;
  onSubmit: (address: ShippingAddress) => void;
  onPincodeChange?: (pincode: string) => void;
}

export function CheckoutAddressStep({
  enabled,
  value,
  onSubmit,
  onPincodeChange,
}: Props) {
  const { data: addresses = [], isLoading, isError } = useSavedAddresses(enabled);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (selectedId || addresses.length === 0) return;
    const matching = value
      ? addresses.find(
          (address) =>
            address.street_address === value.line1 &&
            address.postal_code === value.pincode
        )
      : null;
    const initial =
      matching ??
      addresses.find((address) => address.is_default_shipping) ??
      addresses[0];
    setSelectedId(initial.id);
  }, [addresses, selectedId, value]);

  useEffect(() => {
    if (!selectedId || showForm) return;
    const selected = addresses.find((address) => address.id === selectedId);
    if (selected?.postal_code) {
      onPincodeChange?.(selected.postal_code);
    }
  }, [addresses, onPincodeChange, selectedId, showForm]);

  useEffect(() => {
    if (value?.pincode) {
      onPincodeChange?.(value.pincode);
    }
  }, [onPincodeChange, value?.pincode]);

  if (isLoading) {
    return (
      <div className="flex min-h-44 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (isError || addresses.length === 0 || showForm) {
    return (
      <div className="space-y-4">
        {addresses.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
            ← Use a saved address
          </Button>
        )}
        <AddressForm
          defaultValues={value ?? undefined}
          onSubmit={onSubmit}
          onPincodeChange={onPincodeChange}
        />
      </div>
    );
  }

  const selected = addresses.find((address) => address.id === selectedId);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {addresses.map((address) => {
          const active = selectedId === address.id;
          return (
            <button
              key={address.id}
              type="button"
              onClick={() => setSelectedId(address.id)}
              className={cn(
                "relative rounded-2xl border p-4 text-left transition-all",
                active
                  ? "border-gold bg-gold/5 ring-2 ring-gold/15"
                  : "border-border hover:border-gold/50"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream">
                  <MapPin className="h-4 w-4 text-gold" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-dark">{address.name}</p>
                    {address.is_default_shipping && (
                      <Badge variant="outline" className="text-[10px]">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-warm-gray">
                    {address.street_address}
                    {address.apartment ? `, ${address.apartment}` : ""},{" "}
                    {address.city}, {address.state} — {address.postal_code}
                  </p>
                  <p className="mt-1 text-xs text-warm-gray">{address.phone}</p>
                </div>
              </div>
              {active && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-dark">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 text-sm font-medium text-dark hover:text-gold"
      >
        <Plus className="h-4 w-4" /> Use a different address
      </button>

      <Button
        className="h-12 w-full rounded-full bg-gold font-semibold text-dark hover:bg-gold-dark"
        disabled={!selected}
        onClick={() => selected && onSubmit(toShippingAddress(selected))}
      >
        Review order →
      </Button>
    </div>
  );
}
