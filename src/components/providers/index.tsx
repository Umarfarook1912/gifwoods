"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "./SessionProvider";
import { QueryProvider } from "./QueryProvider";
import { ConfirmDialogProvider } from "@/components/shared/ConfirmDialogProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <QueryProvider>
        <TooltipProvider>
          <ConfirmDialogProvider>
            {children}
            <Toaster richColors position="top-right" />
          </ConfirmDialogProvider>
        </TooltipProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
