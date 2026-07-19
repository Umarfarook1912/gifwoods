"use client";

import { useContext } from "react";
import { ConfirmContext } from "@/components/shared/ConfirmDialogProvider";
import type { ConfirmFn } from "@/types/confirm";

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used within ConfirmDialogProvider");
  }
  return confirm;
}
