import { ROUTES } from "@/constants/routes";
import type { Category } from "@/types/product";

export function getCategoryHref(slug: string): string {
  return `${ROUTES.SHOP}?category=${slug}`;
}

/**
 * Nav links that point to a specific shop category are only shown
 * when that category currently has active products.
 */
export function isCategoryLinkAvailable(href: string, categories: Category[]): boolean {
  const categorySlug = href.split("category=")[1];
  if (!categorySlug) return true;
  return categories.some((category) => category.slug === categorySlug);
}
