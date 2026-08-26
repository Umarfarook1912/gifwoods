"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_ENDPOINTS } from "@/constants/api";
import { CUSTOMIZATION_COPY, CUSTOMIZATION_UPLOAD } from "@/constants/customization";
import { toast } from "sonner";
import type { Customization, Product } from "@/types/product";
import {
  getCustomizationNeed,
  isCustomizationComplete,
  fileNameFromImageUrl,
} from "@/lib/customization";

interface Props {
  orderId: string;
  orderItemId: string;
  product: Pick<Product, "customization_text" | "customization_image">;
  customization: Customization | null;
  canSubmit: boolean;
}

export function OrderItemCustomization({
  orderId,
  orderItemId,
  product,
  customization,
  canSubmit,
}: Props) {
  const need = getCustomizationNeed(product);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Customization | null>(customization);

  if (need === "none") return null;

  const complete = isCustomizationComplete(saved, product);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = new FormData();
      body.append("orderItemId", orderItemId);
      if (product.customization_text) body.append("name", name);
      if (product.customization_image && file) body.append("file", file);
      const res = await fetch(API_ENDPOINTS.ORDER_CUSTOMIZATION(orderId), {
        method: "PATCH",
        body,
      });
      const text = await res.text();
      let json: { data?: { customization?: Customization }; error?: string };
      try {
        json = text ? (JSON.parse(text) as typeof json) : {};
      } catch {
        throw new Error(
          res.ok ? "Invalid server response" : "Upload failed. Please try again."
        );
      }
      if (!res.ok || json.error) throw new Error(json.error ?? "Submit failed");
      if (!json.data?.customization) throw new Error("Submit failed");
      setSaved(json.data.customization);
      toast.success(CUSTOMIZATION_COPY.SUBMITTED);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSaving(false);
    }
  };

  if (complete && saved) {
    return (
      <div className="mt-3 rounded-xl border border-gold/30 bg-gold/5 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold">
          {CUSTOMIZATION_COPY.SUBMITTED_STATUS}
        </p>
        <p className="mt-1 text-sm text-dark">
          {product.customization_image && product.customization_text
            ? CUSTOMIZATION_COPY.SUBMITTED
            : product.customization_image
              ? CUSTOMIZATION_COPY.SUBMITTED_PHOTO
              : CUSTOMIZATION_COPY.SUBMITTED_TEXT}
        </p>
        {saved.name && (
          <p className="mt-1 text-sm text-warm-gray">
            {CUSTOMIZATION_COPY.NAME_LABEL}: {saved.name}
          </p>
        )}
        {saved.photo && (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
              <Image src={saved.photo} alt="Submitted photo" fill className="object-contain" sizes="96px" />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const res = await fetch(saved.photo!);
                  if (!res.ok) throw new Error();
                  const blob = await res.blob();
                  const href = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = href;
                  link.download = fileNameFromImageUrl(
                    saved.photo!,
                    `${CUSTOMIZATION_UPLOAD.FALLBACK_FILE}.jpg`
                  );
                  link.click();
                  URL.revokeObjectURL(href);
                } catch {
                  toast.error("Could not download image");
                }
              }}
            >
              {CUSTOMIZATION_COPY.DOWNLOAD_IMAGE}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!canSubmit) {
    return (
      <p className="mt-2 text-xs font-medium text-gold-dark">
        {CUSTOMIZATION_COPY.PENDING} — {CUSTOMIZATION_COPY.FORM_HELP}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-xl border border-border bg-cream/50 p-3">
      <div>
        <p className="text-sm font-semibold text-dark">{CUSTOMIZATION_COPY.FORM_HEADING}</p>
        <p className="mt-1 text-xs text-warm-gray">{CUSTOMIZATION_COPY.FORM_HELP}</p>
      </div>
      {product.customization_text && (
        <div>
          <Label htmlFor={`name-${orderItemId}`}>{CUSTOMIZATION_COPY.NAME_LABEL}</Label>
          <Input
            id={`name-${orderItemId}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={CUSTOMIZATION_COPY.NAME_PLACEHOLDER}
            className="mt-1"
            required
            minLength={2}
          />
        </div>
      )}
      {product.customization_image && (
        <div>
          <Label htmlFor={`photo-${orderItemId}`}>{CUSTOMIZATION_COPY.PHOTO_LABEL}</Label>
          <Input
            id={`photo-${orderItemId}`}
            type="file"
            accept={CUSTOMIZATION_UPLOAD.ACCEPT}
            className="mt-1"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      )}
      <Button
        type="submit"
        disabled={saving}
        className="bg-gold text-dark hover:bg-gold-dark font-semibold"
      >
        {saving ? "Submitting…" : CUSTOMIZATION_COPY.SUBMIT}
      </Button>
    </form>
  );
}
