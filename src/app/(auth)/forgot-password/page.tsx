import { Suspense } from "react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
