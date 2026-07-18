import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 bg-cream">
      <h1 className="font-display text-3xl font-bold text-dark">Product Not Found</h1>
      <p className="text-warm-gray text-center max-w-sm">
        This product may have been removed or the link might be wrong.
      </p>
      <Button className="bg-gold text-dark hover:bg-gold-dark font-semibold" asChild>
        <Link href={ROUTES.SHOP}>Browse All Gifts</Link>
      </Button>
    </div>
  );
}
