"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRODUCT_OFFER_COPY,
  PRODUCT_OFFER_TYPE_LABELS,
  PRODUCT_OFFER_TYPES,
} from "@/constants/offers";
import type { ProductFormState, ProductOfferType } from "@/types/product";

interface Props {
  form: ProductFormState;
  setForm: (form: ProductFormState) => void;
}

export function ProductOfferFields({ form, setForm }: Props) {
  const hasOffer = Boolean(form.offer_type);

  return (
    <div className="md:col-span-2 space-y-3 rounded-xl border border-border bg-cream/40 p-4">
      <p className="text-sm font-semibold text-dark">{PRODUCT_OFFER_COPY.FORM_SECTION_TITLE}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>{PRODUCT_OFFER_COPY.FORM_TYPE_LABEL}</Label>
          <Select
            value={form.offer_type || "none"}
            onValueChange={(v) =>
              setForm({
                ...form,
                offer_type: !v || v === "none" ? "" : (v as ProductOfferType),
                offer_value: !v || v === "none" ? 0 : form.offer_value,
              })
            }
          >
            <SelectTrigger className="mt-1 w-full bg-white">
              <SelectValue>
                {(value) => {
                  if (!value || value === "none") return PRODUCT_OFFER_COPY.FORM_TYPE_NONE;
                  return PRODUCT_OFFER_TYPE_LABELS[value as ProductOfferType] ?? value;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{PRODUCT_OFFER_COPY.FORM_TYPE_NONE}</SelectItem>
              <SelectItem value={PRODUCT_OFFER_TYPES.PERCENT}>
                {PRODUCT_OFFER_TYPE_LABELS.percent}
              </SelectItem>
              <SelectItem value={PRODUCT_OFFER_TYPES.AMOUNT}>
                {PRODUCT_OFFER_TYPE_LABELS.amount}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasOffer && (
          <div>
            <Label>{PRODUCT_OFFER_COPY.FORM_VALUE_LABEL}</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.offer_value || ""}
              onChange={(e) =>
                setForm({ ...form, offer_value: parseFloat(e.target.value) || 0 })
              }
              className="mt-1 bg-white"
            />
            <p className="mt-1 text-xs text-warm-gray">
              {form.offer_type === PRODUCT_OFFER_TYPES.PERCENT
                ? PRODUCT_OFFER_COPY.FORM_VALUE_PERCENT_HINT
                : PRODUCT_OFFER_COPY.FORM_VALUE_AMOUNT_HINT}
            </p>
          </div>
        )}
      </div>

      {hasOffer && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="offer-starts">{PRODUCT_OFFER_COPY.FORM_START_LABEL}</Label>
            <Input
              id="offer-starts"
              type="datetime-local"
              value={form.offer_starts_at}
              onChange={(e) => setForm({ ...form, offer_starts_at: e.target.value })}
              className="mt-1 bg-white"
            />
          </div>
          <div>
            <Label htmlFor="offer-ends">{PRODUCT_OFFER_COPY.FORM_END_LABEL}</Label>
            <Input
              id="offer-ends"
              type="datetime-local"
              value={form.offer_ends_at}
              onChange={(e) => setForm({ ...form, offer_ends_at: e.target.value })}
              className="mt-1 bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
