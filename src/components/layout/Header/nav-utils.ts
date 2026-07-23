import { ROUTES } from "@/constants/routes";
import type { Category } from "@/types/product";

export function getCategoryHref(slug: string): string {
  return ROUTES.CATEGORY(slug);
}

/**
 * Nav links that point to a specific category page are only shown
 * when that category currently has active products.
 */
export function isCategoryLinkAvailable(href: string, categories: Category[]): boolean {
  const categoryMatch = href.match(/\/categories\/([^/?#]+)/);
  if (categoryMatch) {
    return categories.some((category) => category.slug === categoryMatch[1]);
  }

  const querySlug = href.split("category=")[1]?.split("&")[0];
  if (querySlug) {
    return categories.some((category) => category.slug === querySlug);
  }

  return true;
}

export function isNavLinkActive(
  href: string,
  pathname: string,
  search: string
): boolean {
  if (href === ROUTES.HOME) return pathname === ROUTES.HOME;

  const [path, query = ""] = href.split("?");
  if (pathname !== path) return false;
  if (!query) return true;

  const current = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search
  );
  const expected = new URLSearchParams(query);
  for (const [key, value] of expected.entries()) {
    if (current.get(key) !== value) return false;
  }
  return true;
}
