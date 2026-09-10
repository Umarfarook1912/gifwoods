import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductGrid } from "@/components/features/products/ProductGrid";
import { getActiveOfferProducts } from "@/lib/db/products";
import { PRODUCT_OFFER_COPY } from "@/constants/offers";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: PRODUCT_OFFER_COPY.PAGE_TITLE,
  description: PRODUCT_OFFER_COPY.PAGE_DESCRIPTION,
};

export default async function OffersPage() {
  const products = await getActiveOfferProducts(100);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-border bg-cream py-8">
        <div className="page-container">
          <Link
            href={ROUTES.HOME}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-warm-gray transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <h1 className="font-display text-3xl font-bold text-dark md:text-4xl">
            {PRODUCT_OFFER_COPY.PAGE_TITLE}
          </h1>
          <p className="mt-2 text-warm-gray">{PRODUCT_OFFER_COPY.PAGE_DESCRIPTION}</p>
        </div>
      </div>

      <div className="page-container py-8">
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-cream/40 px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold text-dark">
              {PRODUCT_OFFER_COPY.EMPTY_TITLE}
            </p>
            <Link
              href={ROUTES.SHOP}
              className="mt-5 inline-flex rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gold-dark"
            >
              {PRODUCT_OFFER_COPY.EMPTY_CTA}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
