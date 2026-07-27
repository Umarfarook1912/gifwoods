"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SITE_NAME, SITE_TAGLINE } from "@/constants/ui";
import { ROUTES } from "@/constants/routes";
import { sanitizeCallbackUrl, buildRegisterHref } from "@/lib/auth/callback-url";
import { toast } from "sonner";
import { Globe, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"), ROUTES.HOME);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof fieldErrors = {};
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setLoadingEmail(true);

    const result = await signIn("email-password", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid email or password. Please try again.");
      setLoadingEmail(false);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      toast.error("Failed to sign in with Google");
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <Link href={ROUTES.HOME}>
            <h1 className="font-display font-bold text-3xl text-dark">{SITE_NAME}</h1>
          </Link>
          <p className="text-warm-gray text-sm mt-1">{SITE_TAGLINE}</p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <h2 className="font-display font-bold text-xl text-dark text-center mb-1">
            Welcome back
          </h2>
          <p className="text-warm-gray text-sm text-center mb-6">
            Sign in to track your orders and personalise your experience
          </p>

          {/* ── Email / Password Form ── */}
          <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-sm font-medium text-dark">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((f) => ({ ...f, email: undefined }));
                  }}
                  className={cn(
                    "pl-9",
                    fieldErrors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-sm font-medium text-dark">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((f) => ({ ...f, password: undefined }));
                  }}
                  className={cn(
                    "pl-9 pr-9",
                    fieldErrors.password && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-dark transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            {/* Sign in button */}
            <Button
              id="btn-email-login"
              type="submit"
              disabled={loadingEmail}
              className="w-full bg-dark text-white hover:bg-secondary-dark font-semibold h-11"
            >
              {loadingEmail ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</>
              ) : (
                "Sign in"
              )}
            </Button>

            {/* Register link */}
            <p className="text-center text-sm text-warm-gray">
              Don&apos;t have an account?{" "}
              <Link
                href={buildRegisterHref(callbackUrl)}
                className="text-gold font-semibold hover:underline"
              >
                Create one
              </Link>
            </p>
          </form>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-5">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          {/* ── Google ── */}
          <Button
            id="btn-google-login"
            variant="outline"
            className="w-full border-border text-dark hover:border-gold h-11 font-semibold"
            onClick={handleGoogle}
            disabled={loadingGoogle}
          >
            {loadingGoogle ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Redirecting…</>
            ) : (
              <><Globe className="h-4 w-4 mr-2" /> Continue with Google</>
            )}
          </Button>

          <p className="text-xs text-warm-gray text-center mt-5">
            By continuing, you agree to our{" "}
            <Link href={ROUTES.TERMS} className="text-gold hover:underline">Terms</Link>{" "}
            and{" "}
            <Link href={ROUTES.PRIVACY} className="text-gold hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <p className="text-center text-sm text-warm-gray mt-6">
          <Link href={callbackUrl} className="text-gold hover:underline">
            Continue shopping without signing in →
          </Link>
        </p>

      </div>
    </div>
  );
}
