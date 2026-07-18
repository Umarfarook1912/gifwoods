"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SITE_NAME, SITE_TAGLINE } from "@/constants/ui";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { Globe, User2 } from "lucide-react";

export function LoginForm() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? ROUTES.HOME;

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      toast.error("Failed to sign in with Google");
      setLoadingGoogle(false);
    }
  };

  const handleGuest = async () => {
    setLoadingGuest(true);
    try {
      await signIn("guest", { callbackUrl });
    } catch {
      toast.error("Failed to continue as guest");
      setLoadingGuest(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href={ROUTES.HOME}>
            <h1 className="font-display font-bold text-3xl text-dark">{SITE_NAME}</h1>
          </Link>
          <p className="text-warm-gray text-sm mt-1">{SITE_TAGLINE}</p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <h2 className="font-display font-bold text-xl text-dark text-center mb-2">
            Welcome back
          </h2>
          <p className="text-warm-gray text-sm text-center mb-6">
            Sign in to track your orders and personalize your experience
          </p>

          <div className="space-y-3">
            <Button
              className="w-full bg-dark text-white hover:bg-secondary-dark font-semibold h-11"
              onClick={handleGoogle}
              disabled={loadingGoogle}
            >
              <Globe className="h-4 w-4 mr-2" />
              {loadingGoogle ? "Redirecting..." : "Continue with Google"}
            </Button>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <Button
              variant="outline"
              className="w-full border-border text-dark hover:border-gold h-11 font-semibold"
              onClick={handleGuest}
              disabled={loadingGuest}
            >
              <User2 className="h-4 w-4 mr-2" />
              {loadingGuest ? "Setting up..." : "Continue as Guest"}
            </Button>
          </div>

          <p className="text-xs text-warm-gray text-center mt-6">
            By continuing, you agree to our{" "}
            <Link href={ROUTES.TERMS} className="text-gold hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href={ROUTES.PRIVACY} className="text-gold hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <p className="text-center text-sm text-warm-gray mt-6">
          <Link href={ROUTES.HOME} className="text-gold hover:underline">
            Continue shopping without signing in →
          </Link>
        </p>
      </div>
    </div>
  );
}
