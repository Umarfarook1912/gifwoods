"use client";

import { Button } from "@/components/ui/button";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
      <h2 className="font-display text-2xl font-bold text-dark">Something went wrong</h2>
      <p className="text-warm-gray text-center max-w-sm">{error.message}</p>
      <Button className="bg-gold text-dark hover:bg-gold-dark" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
