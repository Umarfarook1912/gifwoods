import { CUSTOMIZATION_COPY } from "@/constants/customization";
import {
  isCustomizationComplete,
  needsCustomization,
} from "@/lib/customization";
import type { OrderItem } from "@/types/order";
import type { Product } from "@/types/product";

interface Props {
  items?: OrderItem[];
}

export function AdminOrderCustomization({ items }: Props) {
  const rows = (items ?? []).filter((item) =>
    needsCustomization(item.product as Product | undefined)
  );
  if (rows.length === 0) {
    return <span className="text-xs text-warm-gray">—</span>;
  }

  const received = rows.every((item) =>
    isCustomizationComplete(item.customization, item.product as Product)
  );

  return (
    <span
      className={
        received
          ? "text-xs font-semibold text-green-700"
          : "text-xs font-semibold text-gold-dark"
      }
    >
      {received ? CUSTOMIZATION_COPY.HAS_DETAILS : CUSTOMIZATION_COPY.PENDING}
    </span>
  );
}
