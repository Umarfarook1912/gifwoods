"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthIndicator } from "@/components/features/auth/PasswordStrengthIndicator";
import { SITE_NAME, SITE_TAGLINE } from "@/constants/ui";
import { ROUTES } from "@/constants/routes";
import { buildLoginHref, sanitizeCallbackUrl } from "@/lib/auth/callback-url";
import { APP_ERRORS } from "@/constants/errors";
import { toastError } from "@/lib/errors/toast";
import { toast } from "sonner";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"), ROUTES.HOME);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Full name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (!confirm) {
      errors.confirm = "Please confirm your password";
    } else if (password !== confirm) {
      errors.confirm = "Passwords do not match";
    }
    return errors;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setLoading(true);

    try {
      // 1. Create account via API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setFieldErrors({ email: data.error });
        } else {
          toastError(data.error, APP_ERRORS.REGISTRATION_FAILED);
        }
        setLoading(false);
        return;
      }

      // 2. Auto sign-in with newly created credentials
      toast.success("Account created! Signing you in…");
      const result = await signIn("email-password", {
        email: email.toLowerCase().trim(),
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        // Account created but auto-login failed — redirect to login
        toast.info("Account created. Please log in.");
        router.push(buildLoginHref(callbackUrl));
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      toastError(err, APP_ERRORS.GENERIC);
      setLoading(false);
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
            Create your account
          </h2>
          <p className="text-warm-gray text-sm text-center mb-6">
            Join Gifwoods to start personalising gifts
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-name" className="text-sm font-medium text-dark">
                Full name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFieldErrors(f => ({ ...f, name: undefined })); }}
                  className={cn("pl-9", fieldErrors.name && "border-destructive focus-visible:ring-destructive")}
                />
              </div>
              {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-sm font-medium text-dark">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: undefined })); }}
                  className={cn("pl-9", fieldErrors.email && "border-destructive focus-visible:ring-destructive")}
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-password" className="text-sm font-medium text-dark">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: undefined })); }}
                  className={cn("pl-9 pr-9", fieldErrors.password && "border-destructive focus-visible:ring-destructive")}
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
              {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
              <PasswordStrengthIndicator password={password} />
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-confirm" className="text-sm font-medium text-dark">
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setFieldErrors(f => ({ ...f, confirm: undefined })); }}
                  className={cn("pl-9 pr-9", fieldErrors.confirm && "border-destructive focus-visible:ring-destructive")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-dark transition-colors"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.confirm && <p className="text-xs text-destructive">{fieldErrors.confirm}</p>}
            </div>

            <Button
              id="btn-register"
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-dark hover:bg-gold-dark font-semibold h-11 mt-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account…</>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-xs text-warm-gray text-center mt-5">
            By registering, you agree to our{" "}
            <Link href={ROUTES.TERMS} className="text-gold hover:underline">Terms</Link>{" "}
            and{" "}
            <Link href={ROUTES.PRIVACY} className="text-gold hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <p className="text-center text-sm text-warm-gray mt-6">
          Already have an account?{" "}
          <Link href={buildLoginHref(callbackUrl)} className="text-gold font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
