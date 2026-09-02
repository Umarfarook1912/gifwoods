"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_ENDPOINTS } from "@/constants/api";
import { CUSTOMIZATION_COPY, CUSTOMIZATION_UPLOAD } from "@/constants/customization";
import { APP_ERRORS } from "@/constants/errors";
import { toastError } from "@/lib/errors/toast";
import { toast } from "sonner";
import type { Customization, Product } from "@/types/product";
import {
  getCustomizationNeed,
  isCustomizationComplete,
  fileNameFromImageUrl,
  buildCustomizationWhatsAppUrl,
} from "@/lib/customization";

interface Props {
  orderId: string;
  orderItemId: string;
  product: Pick<Product, "name" | "customization_text" | "customization_image">;
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Customization | null>(customization);

  if (need === "none") return null;

  const complete = isCustomizationComplete(saved, product);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (product.customization_text && name.trim().length < 2) {
      toast.error("Please enter at least 2 characters for name / text");
      return;
    }

    setSaving(true);
    const whatsappUrl = buildCustomizationWhatsAppUrl({
      orderId,
      productName: product.name ?? "Custom Gift",
      customizationName: name.trim() || undefined,
      needsImage: Boolean(product.customization_image),
    });

    try {
      const res = await fetch(API_ENDPOINTS.ORDER_CUSTOMIZATION(orderId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderItemId,
          name: product.customization_text ? name.trim() : undefined,
          whatsapp_sent: true,
        }),
      });
      const text = await res.text();
      let json: { data?: { customization?: Customization }; error?: string };
      try {
        json = text ? (JSON.parse(text) as typeof json) : {};
      } catch {
        throw new Error(
          res.ok ? "Invalid server response" : "Submission failed. Please try again."
        );
      }
      if (!res.ok || json.error) throw new Error(json.error ?? "Submit failed");
      if (!json.data?.customization) throw new Error("Submit failed");

      setSaved(json.data.customization);
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      toast.success(CUSTOMIZATION_COPY.SUBMITTED);
    } catch (err) {
      toastError(err, APP_ERRORS.CUSTOMIZATION_SUBMIT_FAILED);
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
            {CUSTOMIZATION_COPY.NAME_LABEL}: <span className="font-medium text-dark">{saved.name}</span>
          </p>
        )}
        {product.customization_image && (
          <div className="mt-2">
            {saved.photo ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
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
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium text-emerald-700">
                  ✓ {CUSTOMIZATION_COPY.WHATSAPP_PHOTO_SENT}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-gold/40 hover:bg-gold/10"
                  onClick={() => {
                    const url = buildCustomizationWhatsAppUrl({
                      orderId,
                      productName: product.name ?? "Custom Gift",
                      customizationName: saved.name,
                      needsImage: true,
                    });
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                >
                  {CUSTOMIZATION_COPY.REOPEN_WHATSAPP}
                </Button>
              </div>
            )}
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
        <div className="rounded-lg border border-gold/30 bg-gold/10 p-3">
          <p className="text-xs font-semibold text-dark">{CUSTOMIZATION_COPY.PHOTO_LABEL}</p>
          <p className="mt-1 text-xs text-warm-gray leading-relaxed">
            {CUSTOMIZATION_COPY.WHATSAPP_PHOTO_HINT}
          </p>
        </div>
      )}
      <Button
        type="submit"
        disabled={saving}
        className="bg-gold text-dark hover:bg-gold-dark font-semibold"
      >
        {saving
          ? "Opening WhatsApp…"
          : product.customization_image
            ? CUSTOMIZATION_COPY.SUBMIT_WHATSAPP
            : CUSTOMIZATION_COPY.SUBMIT}
      </Button>
    </form>
  );
}
