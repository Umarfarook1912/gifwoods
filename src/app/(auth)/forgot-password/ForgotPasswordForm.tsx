"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE_NAME, SITE_TAGLINE } from "@/constants/ui";
import { AUTH_COPY } from "@/constants/auth";
import { ROUTES } from "@/constants/routes";
import { API_ENDPOINTS } from "@/constants/api";
import { APP_ERRORS } from "@/constants/errors";
import { toastError } from "@/lib/errors/toast";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldError, setFieldError] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setFieldError("Email is required");
      return;
    }

    setFieldError(undefined);
    setLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const json = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || json.error) {
        toastError(json.error, APP_ERRORS.PASSWORD_RESET_FAILED);
        return;
      }

      setSubmitted(true);
    } catch {
      toastError(null, APP_ERRORS.PASSWORD_RESET_FAILED);
    } finally {
      setLoading(false);
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
          <h2 className="font-display font-bold text-xl text-dark text-center mb-1">
            {AUTH_COPY.FORGOT_PASSWORD_TITLE}
          </h2>
          <p className="text-warm-gray text-sm text-center mb-6">
            {AUTH_COPY.FORGOT_PASSWORD_SUBTITLE}
          </p>

          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm text-dark leading-relaxed">
                {AUTH_COPY.FORGOT_PASSWORD_SUCCESS}
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full border-border h-11 font-semibold"
              >
                <Link href={ROUTES.LOGIN}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {AUTH_COPY.FORGOT_PASSWORD_BACK_TO_LOGIN}
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-sm font-medium text-dark">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldError(undefined);
                    }}
                    className={cn(
                      "pl-9",
                      fieldError && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                </div>
                {fieldError && (
                  <p className="text-xs text-destructive">{fieldError}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-dark text-white hover:bg-secondary-dark font-semibold h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {AUTH_COPY.FORGOT_PASSWORD_SENDING}
                  </>
                ) : (
                  AUTH_COPY.FORGOT_PASSWORD_SUBMIT
                )}
              </Button>

              <p className="text-center text-sm text-warm-gray">
                <Link
                  href={ROUTES.LOGIN}
                  className="text-gold font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {AUTH_COPY.FORGOT_PASSWORD_BACK_TO_LOGIN}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
