import type { Metadata } from "next";
import { AdminCarouselClient } from "@/components/features/admin/AdminCarouselClient";
import { getAllHomepageCarouselSlides } from "@/lib/db/homepage-carousel";

export const metadata: Metadata = { title: "Homepage Carousel" };
export const dynamic = "force-dynamic";

export default async function AdminCarouselPage() {
  const slides = await getAllHomepageCarouselSlides();
  return <AdminCarouselClient initialSlides={slides} />;
}
