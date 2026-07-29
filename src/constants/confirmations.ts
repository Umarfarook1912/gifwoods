import type { ConfirmOptions } from "@/types/confirm";

export const CONFIRM_DEFAULTS = {
  CONFIRM_LABEL: "Confirm",
  CANCEL_LABEL: "Cancel",
} as const;

export const CONFIRMATIONS = {
  PRODUCT_DELETE: {
    title: "Delete this product?",
    description:
      "Products that were never ordered are deleted permanently. Products with past orders are archived instead, so customer order history stays intact.",
    confirmLabel: "Delete Product",
    variant: "destructive",
  },
  REVIEW_DELETE: {
    title: "Delete this review?",
    description: "The review will be permanently removed. This cannot be undone.",
    confirmLabel: "Delete Review",
    variant: "destructive",
  },
  ADDRESS_DELETE: {
    title: "Delete this address?",
    description: "This address will be removed from your address book.",
    confirmLabel: "Delete Address",
    variant: "destructive",
  },
  CART_CLEAR: {
    title: "Clear your cart?",
    description: "All items will be removed from your cart.",
    confirmLabel: "Clear Cart",
    variant: "destructive",
  },
  ORDER_DELETE: {
    title: "Delete this order?",
    description: "The order, including its items and reviews, will be permanently deleted. This action cannot be undone.",
    confirmLabel: "Delete Order",
    variant: "destructive",
  },
} as const satisfies Record<string, ConfirmOptions>;

export function categoryDeleteConfirmation(name: string): ConfirmOptions {
  return {
    title: `Delete "${name}"?`,
    description:
      "This category will be removed permanently. Categories that still contain products cannot be deleted.",
    confirmLabel: "Delete Category",
    variant: "destructive",
  };
}

export function userRoleChangeConfirmation(
  userName: string,
  newRole: string
): ConfirmOptions {
  return {
    title: `Change role to ${newRole}?`,
    description: `${userName} will get "${newRole}" permissions immediately.`,
    confirmLabel: "Change Role",
    variant: "default",
  };
}
