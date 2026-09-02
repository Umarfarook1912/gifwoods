import { SHIPROCKET_ERRORS } from "@/constants/shipping";
import { toUserErrorMessage } from "@/lib/errors/user-message";

interface AwbFailureResponse {
  awb_assign_status?: number;
  status_code?: number;
  message?: string;
  response?: {
    data?: {
      awb_assign_error?: string;
    };
  };
}

function extractRawMessage(resp: AwbFailureResponse): string {
  return (
    resp.response?.data?.awb_assign_error?.trim() ??
    resp.message?.trim() ??
    ""
  );
}

function isWalletRechargeIssue(message: string, statusCode?: number): boolean {
  if (statusCode === 350) return true;

  const lower = message.toLowerCase();
  return lower.includes("wallet") && lower.includes("recharge");
}

export function formatShiprocketAwbError(resp: AwbFailureResponse): string {
  const raw = extractRawMessage(resp);

  if (isWalletRechargeIssue(raw, resp.status_code)) {
    return SHIPROCKET_ERRORS.WALLET_RECHARGE;
  }

  return SHIPROCKET_ERRORS.AWB_GENERIC;
}

export function formatShiprocketPushError(error: unknown): string {
  return toUserErrorMessage(error, SHIPROCKET_ERRORS.PUSH_FAILED);
}
