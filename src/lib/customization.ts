import { CUSTOMIZATION_COPY } from "@/constants/customization";
import type { Customization, Product } from "@/types/product";

export type CustomizationNeed = "none" | "text" | "image" | "both";

export function getCustomizationNeed(product?: Pick<
  Product,
  "customization_text" | "customization_image"
> | null): CustomizationNeed {
  const text = Boolean(product?.customization_text);
  const image = Boolean(product?.customization_image);
  if (text && image) return "both";
  if (text) return "text";
  if (image) return "image";
  return "none";
}

export function needsCustomization(
  product?: Pick<Product, "customization_text" | "customization_image"> | null
): boolean {
  return getCustomizationNeed(product) !== "none";
}

export function getNeedLabel(need: CustomizationNeed): string {
  if (need === "both") return CUSTOMIZATION_COPY.NEED_BOTH;
  if (need === "text") return CUSTOMIZATION_COPY.NEED_TEXT;
  if (need === "image") return CUSTOMIZATION_COPY.NEED_IMAGE;
  return "—";
}

export function isCustomizationComplete(
  customization: Customization | null | undefined,
  product?: Pick<Product, "customization_text" | "customization_image"> | null
): boolean {
  const need = getCustomizationNeed(product);
  if (need === "none") return true;
  const name = customization?.name?.trim();
  const photo = customization?.photo?.trim();
  if (need === "text") return Boolean(name);
  if (need === "image") return Boolean(photo);
  return Boolean(name && photo);
}

export function productNotice(need: CustomizationNeed): string | null {
  if (need === "both") return CUSTOMIZATION_COPY.PRODUCT_NOTICE_BOTH;
  if (need === "text") return CUSTOMIZATION_COPY.PRODUCT_NOTICE_TEXT;
  if (need === "image") return CUSTOMIZATION_COPY.PRODUCT_NOTICE_IMAGE;
  return null;
}

export function sanitizeFolderStem(value: string, fallback: string): string {
  const stem = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return stem || fallback;
}

/** Last path segment of an ImageKit URL, e.g. umarfarook.jpg */
export function fileNameFromImageUrl(url: string, fallback: string): string {
  try {
    const path = new URL(url).pathname;
    const last = path.split("/").filter(Boolean).pop();
    if (!last) return fallback;
    return decodeURIComponent(last);
  } catch {
    return fallback;
  }
}

/** "Umar Farook" -> "umarfarook" for ImageKit file names. */
export function sanitizeFileStem(value: string, fallback: string): string {
  const stem = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 60);
  return stem || fallback;
}
