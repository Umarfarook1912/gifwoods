import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductGrid } from "@/components/features/products/ProductGrid";
import { Pagination } from "@/components/shared/Pagination";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";
import { ITEMS_PER_PAGE } from "@/constants/ui";
import type { Category, Product } from "@/types/product";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
}

async function getCategory(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, description, created_at")
    .eq("slug", slug)
    .maybeSingle();

  return (data as Category | null) ?? null;
}

async function getCategoryProducts(
  categoryId: string,
  page: number = 1
): Promise<{ products: Product[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data, count } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)", { count: "exact" })
    .eq("status", "active")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    products: (data ?? []) as Product[],
    total: count ?? 0,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: category.name,
    description:
      category.description ??
      `Shop ${category.name} gifts from Gifwoods — personalized and handcrafted.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const pageNum = parseInt(resolvedSearchParams.page || "1");
  const category = await getCategory(slug);
  if (!category) notFound();

  const { products, total } = await getCategoryProducts(category.id, pageNum);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-cream border-b border-border py-8">
        <div className="page-container">
          <Link
            href={ROUTES.SHOP}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-warm-gray transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </Link>
          <h1 className="font-display text-3xl font-bold text-dark md:text-4xl">
            {category.name}
          </h1>
          {category.description ? (
            <p className="mt-2 max-w-2xl text-warm-gray">{category.description}</p>
          ) : (
            <p className="mt-2 text-warm-gray">
              {total} {total === 1 ? "product" : "products"}
            </p>
          )}
          {category.description && (
            <p className="mt-1 text-sm text-warm-gray">
              {total} {total === 1 ? "product" : "products"}
            </p>
          )}
        </div>
      </div>

      <div className="page-container py-8">
        {products.length > 0 ? (
          <>
            <ProductGrid products={products} />
            <Pagination
              currentPage={pageNum}
              totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
              totalCount={total}
              itemsPerPage={ITEMS_PER_PAGE}
              className="mt-8"
            />
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-cream/40 px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold text-dark">
              No products in this category yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-warm-gray">
              Check back soon, or browse the full shop for more gifts.
            </p>
            <Link
              href={ROUTES.SHOP}
              className="mt-5 inline-flex rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gold-dark"
            >
              Browse all gifts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
