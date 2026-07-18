import { Suspense } from "react";
import { RegisterForm } from "./RegisterForm";

export const metadata = {
  title: "Create Account | Gifwoods",
  description: "Register for a Gifwoods account to track your personalised gift orders.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
