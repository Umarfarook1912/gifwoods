"use client";

import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CUSTOMIZATION_COPY, CUSTOMIZATION_UPLOAD } from "@/constants/customization";
import { ROUTES } from "@/constants/routes";
import {
  getCustomizationNeed,
  getNeedLabel,
  isCustomizationComplete,
  needsCustomization,
  fileNameFromImageUrl,
} from "@/lib/customization";
import { toast } from "sonner";
import type { Order, OrderItem } from "@/types/order";
import type { Product } from "@/types/product";

interface Props {
  order: Order | null;
  onClose: () => void;
}

async function downloadPhoto(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

function ItemDetails({ item }: { item: OrderItem }) {
  const product = item.product as Product | undefined;
  if (!product || !needsCustomization(product)) return null;
  const received = isCustomizationComplete(item.customization, product);
  const need = getCustomizationNeed(product);

  const handleDownload = async () => {
    const url = item.customization?.photo;
    if (!url) return;
    try {
      await downloadPhoto(
        url,
        fileNameFromImageUrl(url, `${CUSTOMIZATION_UPLOAD.FALLBACK_FILE}.jpg`)
      );
    } catch {
      toast.error("Could not download image");
    }
  };

  return (
    <div className="rounded-xl border border-border p-4 space-y-2">
      <p className="text-sm font-semibold text-dark">{product.name}</p>
      <p className="text-xs text-warm-gray">
        Need: {getNeedLabel(need)} ·{" "}
        {received ? CUSTOMIZATION_COPY.RECEIVED_STATUS : CUSTOMIZATION_COPY.PENDING}
      </p>
      {item.customization?.name && (
        <p className="text-sm text-dark">
          {CUSTOMIZATION_COPY.NAME_LABEL}: {item.customization.name}
        </p>
      )}
      {item.customization?.photo && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-border bg-white">
            <Image
              src={item.customization.photo}
              alt="Customization"
              fill
              className="object-contain"
              sizes="128px"
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {CUSTOMIZATION_COPY.DOWNLOAD_IMAGE}
          </Button>
        </div>
      )}
    </div>
  );
}

export function AdminCustomizationDialog({ order, onClose }: Props) {
  const rows = (order?.order_items ?? []).filter((item) =>
    needsCustomization(item.product as Product | undefined)
  );

  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{CUSTOMIZATION_COPY.VIEW_DETAILS}</DialogTitle>
        </DialogHeader>
        {rows.length === 0 ? (
          <p className="text-sm text-warm-gray">—</p>
        ) : (
          <div className="space-y-3">
            {rows.map((item) => (
              <ItemDetails key={item.id} item={item} />
            ))}
          </div>
        )}
        {order && (
          <Link
            href={ROUTES.ORDER_DETAIL(order.id)}
            className="text-sm font-medium text-gold hover:text-gold-dark"
          >
            Open full order
          </Link>
        )}
      </DialogContent>
    </Dialog>
  );
}
