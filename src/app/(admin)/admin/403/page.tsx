import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ShieldAlert } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <ShieldAlert className="h-8 w-8 text-destructive animate-pulse" />
      </div>
      
      <div className="space-y-2">
        <span className="text-destructive font-display font-bold text-6xl">403</span>
        <h1 className="font-display text-3xl font-bold text-dark">Access Denied</h1>
        <p className="text-warm-gray max-w-md mx-auto">
          You do not have the required permissions to access this page or menu. Please contact the Super Admin if you believe this is a mistake.
        </p>
      </div>

      <div className="flex gap-3 mt-4">
        <Button className="bg-gold text-dark hover:bg-gold-dark font-semibold" asChild>
          <Link href={ROUTES.ADMIN.DASHBOARD}>Go to Dashboard</Link>
        </Button>
        <Button variant="outline" className="border-gold/30 hover:border-gold" asChild>
          <Link href="/">Back to Store</Link>
        </Button>
      </div>
    </div>
  );
}
