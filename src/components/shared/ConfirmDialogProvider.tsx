"use client";

import { createContext, useCallback, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { CONFIRM_DEFAULTS } from "@/constants/confirmations";
import type { ConfirmFn, ConfirmOptions } from "@/types/confirm";

export const ConfirmContext = createContext<ConfirmFn | null>(null);

interface Props {
  children: ReactNode;
}

export function ConfirmDialogProvider({ children }: Props) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOptions(opts);
    });
  }, []);

  const close = (result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  };

  const isDestructive = options?.variant !== "default";
  const Icon = isDestructive ? Trash2 : AlertTriangle;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={options !== null} onOpenChange={(open) => !open && close(false)}>
        <AlertDialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden gap-0">
          {options && (
            <>
              <div className="flex flex-col items-center text-center px-6 pt-8 pb-6">
                <span
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center mb-4",
                    isDestructive
                      ? "bg-destructive/10 text-destructive"
                      : "bg-gold/15 text-gold"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <AlertDialogTitle className="font-display text-lg font-bold text-dark">
                  {options.title}
                </AlertDialogTitle>
                {options.description && (
                  <AlertDialogDescription className="mt-2 text-sm text-warm-gray leading-relaxed">
                    {options.description}
                  </AlertDialogDescription>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-border bg-cream/50 px-6 py-4">
                <Button
                  variant="outline"
                  className="rounded-full border-border hover:border-gold hover:bg-gold/5"
                  onClick={() => close(false)}
                >
                  {options.cancelLabel ?? CONFIRM_DEFAULTS.CANCEL_LABEL}
                </Button>
                <Button
                  className={cn(
                    "rounded-full font-semibold",
                    isDestructive
                      ? "bg-destructive text-white hover:bg-destructive/90"
                      : "bg-gold text-dark hover:bg-gold-dark"
                  )}
                  onClick={() => close(true)}
                >
                  {options.confirmLabel ?? CONFIRM_DEFAULTS.CONFIRM_LABEL}
                </Button>
              </div>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
