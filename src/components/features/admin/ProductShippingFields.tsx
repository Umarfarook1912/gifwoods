"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRODUCT_SHIPPING_FIELDS } from "@/constants/shipping";
import type { ProductFormState } from "@/types/product";

interface Props {
  form: ProductFormState;
  setForm: (form: ProductFormState) => void;
}

export function ProductShippingFields({ form, setForm }: Props) {
  return (
    <div className="md:col-span-2 grid grid-cols-2 gap-4">
      <div>
        <Label>{PRODUCT_SHIPPING_FIELDS.SHIPPING_CHARGE_LABEL}</Label>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={form.shipping_charge}
          onChange={(e) =>
            setForm({
              ...form,
              shipping_charge: parseFloat(e.target.value) || 0,
            })
          }
          className="mt-1"
        />
      </div>
      <div>
        <Label>{PRODUCT_SHIPPING_FIELDS.FAST_SHIPPING_CHARGE_LABEL}</Label>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={form.fast_shipping_charge}
          onChange={(e) =>
            setForm({
              ...form,
              fast_shipping_charge: parseFloat(e.target.value) || 0,
            })
          }
          className="mt-1"
        />
        <p className="mt-1 text-xs text-warm-gray">
          {PRODUCT_SHIPPING_FIELDS.FAST_SHIPPING_HINT}
        </p>
      </div>
    </div>
  );
}
