import { INVOICE_COLORS, INVOICE_GST } from "@/constants/invoice";
import { roundMoney } from "@/lib/orders/pricing";
import type { OrderItem } from "@/types/order";

export function escapeInvoiceHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatInvoiceMoney(amount: number): string {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatInvoiceDate(dateString: string): string {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

export function formatTaxInvoiceNumber(orderId: string): string {
  const digits = orderId.replace(/\D/g, "").slice(-6).padStart(6, "0");
  return `INV-${digits}`;
}

function lineTaxShare(lineTotal: number, subtotal: number, gstAmount: number) {
  if (subtotal <= 0 || gstAmount <= 0) return { cgst: 0, sgst: 0 };
  const share = (lineTotal / subtotal) * gstAmount;
  const half = roundMoney(share / 2);
  return { cgst: half, sgst: half };
}

export function buildInvoiceItemRows(
  items: OrderItem[],
  subtotal: number,
  gstAmount: number
): string {
  return items
    .map((item, index) => {
      const name = escapeInvoiceHtml(item.product?.name || "Product");
      const lineTotal = roundMoney(item.unit_price * item.quantity);
      const { cgst, sgst } = lineTaxShare(lineTotal, subtotal, gstAmount);
      const qtyPrice = `${item.quantity.toFixed(2)} x ${formatInvoiceMoney(item.unit_price)}`;
      return `
        <tr>
          <td style="padding:12px 8px;vertical-align:top;color:${INVOICE_COLORS.dark};">${index + 1}</td>
          <td style="padding:12px 8px;vertical-align:top;">
            <div style="font-weight:600;color:${INVOICE_COLORS.dark};">${name}</div>
            <div style="font-size:11px;color:${INVOICE_COLORS.muted};margin-top:2px;">${qtyPrice}</div>
          </td>
          <td style="padding:12px 8px;vertical-align:top;text-align:right;">
            <div>${formatInvoiceMoney(cgst)}</div>
            <div style="font-size:11px;color:${INVOICE_COLORS.muted};">${INVOICE_GST.HALF_RATE_LABEL}</div>
          </td>
          <td style="padding:12px 8px;vertical-align:top;text-align:right;">
            <div>${formatInvoiceMoney(sgst)}</div>
            <div style="font-size:11px;color:${INVOICE_COLORS.muted};">${INVOICE_GST.HALF_RATE_LABEL}</div>
          </td>
          <td style="padding:12px 8px;vertical-align:top;text-align:right;font-weight:600;">
            ${formatInvoiceMoney(lineTotal)}
          </td>
        </tr>`;
    })
    .join("");
}
