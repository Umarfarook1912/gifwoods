import { toast } from "sonner";
import { toUserErrorMessage } from "@/lib/errors/user-message";

export function toastError(error: unknown, fallback: string): void {
  toast.error(toUserErrorMessage(error, fallback));
}
