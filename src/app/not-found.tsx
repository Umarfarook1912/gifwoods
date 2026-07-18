import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SITE_NAME } from "@/constants/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="text-gold font-display font-bold text-6xl">404</span>
      <h1 className="font-display text-3xl font-bold text-dark">Page Not Found</h1>
      <p className="text-warm-gray max-w-md">
        The page you're looking for doesn't exist or has been moved. Let's get you back to shopping.
      </p>
      <div className="flex gap-3">
        <Button className="bg-gold text-dark hover:bg-gold-dark font-semibold" asChild>
          <Link href={ROUTES.HOME}>Go Home</Link>
        </Button>
        <Button variant="outline" className="border-gold/30 hover:border-gold" asChild>
          <Link href={ROUTES.SHOP}>Browse Gifts</Link>
        </Button>
      </div>
      <Link href={ROUTES.HOME} className="font-display font-bold text-dark text-2xl mt-4">
        {SITE_NAME}
      </Link>
    </div>
  );
}
