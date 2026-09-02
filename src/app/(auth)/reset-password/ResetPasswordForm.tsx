"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/features/auth/PasswordField";
import { PasswordStrengthIndicator } from "@/components/features/auth/PasswordStrengthIndicator";
import { SITE_NAME, SITE_TAGLINE } from "@/constants/ui";
import { AUTH_COPY, AUTH_QUERY } from "@/constants/auth";
import { ROUTES } from "@/constants/routes";
import { APP_ERRORS } from "@/constants/errors";
import { createClient } from "@/lib/supabase/client";
import { toastError } from "@/lib/errors/toast";
import { usePasswordRecoveryLink } from "@/hooks/usePasswordRecoveryLink";
import { Loader2, AlertCircle, Mail } from "lucide-react";

interface FieldErrors {
  password?: string;
  confirm?: string;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const { linkState, email } = usePasswordRecoveryLink();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("Reset password: updateUser failed", error);
        toastError(error, APP_ERRORS.PASSWORD_UPDATE_FAILED);
        return;
      }

      await supabase.auth.signOut();
      router.push(
        `${ROUTES.LOGIN}?${AUTH_QUERY.RESET_SUCCESS}=${AUTH_QUERY.RESET_SUCCESS_VALUE}`
      );
    } catch {
      toastError(null, APP_ERRORS.PASSWORD_UPDATE_FAILED);
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
          {linkState === "loading" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
              <p className="text-sm text-warm-gray">Verifying reset link…</p>
            </div>
          )}

          {linkState === "invalid" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm text-dark leading-relaxed">
                {AUTH_COPY.RESET_PASSWORD_INVALID_LINK}
              </p>
              <Button asChild className="w-full bg-dark text-white hover:bg-secondary-dark h-11">
                <Link href={ROUTES.FORGOT_PASSWORD}>
                  {AUTH_COPY.RESET_PASSWORD_REQUEST_NEW}
                </Link>
              </Button>
            </div>
          )}

          {linkState === "ready" && (
            <>
              <h2 className="font-display font-bold text-xl text-dark text-center mb-1">
                {AUTH_COPY.RESET_PASSWORD_TITLE}
              </h2>
              <p className="text-warm-gray text-sm text-center mb-6">
                {AUTH_COPY.RESET_PASSWORD_SUBTITLE}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {email && (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="reset-email"
                      className="text-sm font-medium text-dark"
                    >
                      {AUTH_COPY.RESET_PASSWORD_EMAIL_LABEL}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="reset-email"
                        type="email"
                        value={email}
                        readOnly
                        tabIndex={-1}
                        className="pl-9 bg-muted/50 text-warm-gray cursor-default"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <PasswordField
                    id="reset-password"
                    label={AUTH_COPY.NEW_PASSWORD_LABEL}
                    value={password}
                    onChange={(value) => {
                      setPassword(value);
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    show={showPassword}
                    onToggleShow={() => setShowPassword((s) => !s)}
                    error={fieldErrors.password}
                    autoComplete="new-password"
                  />
                  <PasswordStrengthIndicator password={password} />
                </div>

                <PasswordField
                  id="reset-confirm"
                  label={AUTH_COPY.CONFIRM_PASSWORD_LABEL}
                  value={confirm}
                  onChange={(value) => {
                    setConfirm(value);
                    setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
                  }}
                  show={showConfirm}
                  onToggleShow={() => setShowConfirm((s) => !s)}
                  error={fieldErrors.confirm}
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-dark text-white hover:bg-secondary-dark font-semibold h-11"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {AUTH_COPY.RESET_PASSWORD_UPDATING}
                    </>
                  ) : (
                    AUTH_COPY.RESET_PASSWORD_SUBMIT
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
