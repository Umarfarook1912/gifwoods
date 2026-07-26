"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUCT_SHARE_MESSAGES, SITE_NAME } from "@/constants/ui";
import { toast } from "sonner";

interface Props {
  name: string;
  description: string;
}

export function ProductShareButton({ name, description }: Props) {
  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: `${name} | ${SITE_NAME}`,
      text: description.slice(0, 120),
      url,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        toast.success(PRODUCT_SHARE_MESSAGES.SHARED);
        return;
      }

      await navigator.clipboard.writeText(url);
      toast.success(PRODUCT_SHARE_MESSAGES.COPIED);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        toast.success(PRODUCT_SHARE_MESSAGES.COPIED);
      } catch {
        toast.error(PRODUCT_SHARE_MESSAGES.FAILED);
      }
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-12 w-12 border-border hover:border-gold"
      onClick={handleShare}
      aria-label="Share product"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}
