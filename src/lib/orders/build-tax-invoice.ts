import {
  INVOICE_BANK,
  INVOICE_BUSINESS,
  INVOICE_COLORS,
  INVOICE_COPY,
  INVOICE_DOCUMENT_CSS,
  INVOICE_FONTS,
  INVOICE_GST,
  INVOICE_TERMS,
} from "@/constants/invoice";
import { ASSETS } from "@/constants/assets";
import { amountInIndianWords } from "@/lib/orders/amount-in-words";
import { roundMoney } from "@/lib/orders/pricing";
import {
  buildInvoiceItemRows,
  escapeInvoiceHtml,
  formatInvoiceDate,
  formatInvoiceMoney,
  formatTaxInvoiceNumber,
} from "@/lib/orders/invoice-format";
import type { Order } from "@/types/order";

function resolveCustomerName(order: Order): string {
  const fromProfile = order.user?.name?.trim();
  const fromAddress = order.shipping_address?.name?.trim();
  // Prefer account name; address "name" is often a label like "Home".
  return (fromProfile || fromAddress || "Customer").toUpperCase();
}

export function buildTaxInvoiceHtml(order: Order, origin: string): string {
  const addr = order.shipping_address;
  const gstAmount = Number(order.gst_amount ?? 0);
  const cgstTotal = roundMoney(gstAmount / 2);
  const sgstTotal = roundMoney(gstAmount / 2);
  const invoiceNo = formatTaxInvoiceNumber(order.id);
  const invoiceDate = formatInvoiceDate(order.created_at);
  const supplyState = addr?.state?.trim() || INVOICE_BUSINESS.state;
  const placeOfSupply = `${supplyState} (${INVOICE_BUSINESS.stateCode})`;
  const logoUrl = `${origin}${ASSETS.LOGO}`;
  const items = order.order_items ?? [];
  const balance = Number(order.total);
  const customerName = resolveCustomerName(order);
  const c = INVOICE_COLORS;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${INVOICE_COPY.TITLE} - ${invoiceNo}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${INVOICE_FONTS.GOOGLE_HREF}" rel="stylesheet" />
  <style>${INVOICE_DOCUMENT_CSS}</style>
</head>
<body>
  <div class="toolbar">
    <div>
      <div style="font-size:13px;color:${c.muted};">${INVOICE_COPY.DIGITAL_LABEL}</div>
      <div style="font-size:11px;color:${c.muted};margin-top:2px;max-width:420px;">${INVOICE_COPY.PRINT_HINT}</div>
    </div>
    <div>
      <button class="btn-print" onclick="window.print()">${INVOICE_COPY.PRINT}</button>
      <button class="btn-close" onclick="window.close()">${INVOICE_COPY.CLOSE}</button>
    </div>
  </div>

  <div class="sheet">
    <div class="invoice-header">
      <div class="logo-wrap">
        <div class="logo-box">
          <img src="${logoUrl}" alt="${escapeInvoiceHtml(INVOICE_BUSINESS.legalName)}" style="height:72px;width:auto;max-width:120px;object-fit:contain;display:block;" />
        </div>
      </div>
      <div class="title-cell display">${INVOICE_COPY.TITLE}</div>
      <div class="meta-cell">
        <div class="brand display" style="font-weight:700;font-size:15px;">${escapeInvoiceHtml(INVOICE_BUSINESS.legalName)}</div>
        ${INVOICE_BUSINESS.addressLines.map((l) => `<div>${escapeInvoiceHtml(l)}</div>`).join("")}
        <div style="margin-top:4px;">GSTIN ${escapeInvoiceHtml(INVOICE_BUSINESS.gstin)}</div>
      </div>
    </div>

    <div class="bill-bar">
      <div class="left" style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${c.muted};font-weight:700;">
        ${INVOICE_COPY.BILL_TO}
      </div>
      <div class="right display" style="font-size:15px;">
        ${INVOICE_COPY.BALANCE_DUE} ${formatInvoiceMoney(balance)}
      </div>
    </div>

    <div style="padding:22px 24px;display:table;width:100%;">
      <div style="display:table-cell;vertical-align:top;padding-right:16px;">
        <div class="display" style="font-size:26px;font-weight:700;line-height:1.15;">
          ${escapeInvoiceHtml(customerName)}
        </div>
        <div style="margin-top:8px;font-size:13px;color:${c.muted};">
          ${INVOICE_COPY.PLACE_OF_SUPPLY}: ${escapeInvoiceHtml(placeOfSupply)}
        </div>
        <div style="margin-top:6px;font-size:13px;line-height:1.55;">
          ${escapeInvoiceHtml(addr?.line1 || "")}${addr?.line2 ? `, ${escapeInvoiceHtml(addr.line2)}` : ""}<br/>
          ${escapeInvoiceHtml(addr?.city || "")}${addr?.city ? ", " : ""}${escapeInvoiceHtml(addr?.state || "")}${addr?.pincode ? ` — ${escapeInvoiceHtml(addr.pincode)}` : ""}<br/>
          ${addr?.phone ? `Phone: ${escapeInvoiceHtml(addr.phone)}` : ""}
        </div>
      </div>
      <div style="display:table-cell;vertical-align:top;width:240px;font-size:13px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="color:${c.muted};">Invoice#</span><span style="font-weight:600;">${invoiceNo}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="color:${c.muted};">Invoice Date</span><span>${invoiceDate}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="color:${c.muted};">Terms</span><span>${INVOICE_COPY.TERMS_DUE}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:${c.muted};">Due Date</span><span>${invoiceDate}</span>
        </div>
      </div>
    </div>

    <div style="padding:0 24px 6px;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr class="table-head" style="text-align:left;">
            <th style="padding:10px 8px;width:36px;">#</th>
            <th style="padding:10px 8px;">ITEM &amp; DESCRIPTION</th>
            <th style="padding:10px 8px;text-align:right;">${INVOICE_GST.CGST_LABEL}</th>
            <th style="padding:10px 8px;text-align:right;">${INVOICE_GST.SGST_LABEL}</th>
            <th style="padding:10px 8px;text-align:right;">AMOUNT</th>
          </tr>
        </thead>
        <tbody style="border-bottom:1px solid ${c.border};">
          ${buildInvoiceItemRows(items, Number(order.subtotal), gstAmount)}
        </tbody>
      </table>
    </div>

    <div class="summary-box">
      <div class="col" style="font-size:12px;line-height:1.55;">
        <div style="margin-bottom:10px;">${INVOICE_COPY.NOTES_BODY}</div>
        <div style="font-weight:700;margin-bottom:4px;color:${c.accentDark};">${INVOICE_COPY.BANK_TITLE}</div>
        <div>${escapeInvoiceHtml(INVOICE_BANK.accountName)}</div>
        <div>${escapeInvoiceHtml(INVOICE_BANK.bankName)}</div>
        <div>Account # ${escapeInvoiceHtml(INVOICE_BANK.accountNumber)}</div>
        <div>${escapeInvoiceHtml(INVOICE_BANK.accountType)}</div>
        <div>IFSC code ${escapeInvoiceHtml(INVOICE_BANK.ifsc)}</div>
        <div style="margin-top:8px;">${INVOICE_BANK.gpayLabel}: ${escapeInvoiceHtml(INVOICE_BANK.gpayNumber)}</div>
        <div>${INVOICE_BANK.phonepeLabel}: ${escapeInvoiceHtml(INVOICE_BANK.phonepeNumber)}</div>
      </div>
      <div class="col" style="font-size:13px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
          <span>Sub Total</span><span>${formatInvoiceMoney(Number(order.subtotal))}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
          <span>${INVOICE_GST.CGST_TOTAL_LABEL}</span><span>${formatInvoiceMoney(cgstTotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
          <span>${INVOICE_GST.SGST_TOTAL_LABEL}</span><span>${formatInvoiceMoney(sgstTotal)}</span>
        </div>
        ${
          Number(order.shipping_cost) > 0
            ? `<div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                <span>Shipping</span><span>${formatInvoiceMoney(Number(order.shipping_cost))}</span>
              </div>`
            : ""
        }
        <div class="display" style="display:flex;justify-content:space-between;margin:10px 0 6px;font-size:16px;font-weight:700;">
          <span>Total</span><span>${formatInvoiceMoney(balance)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:700;color:${c.accentDark};">
          <span>${INVOICE_COPY.BALANCE_DUE}</span><span>${formatInvoiceMoney(balance)}</span>
        </div>
      </div>
    </div>

    <div class="display" style="padding:8px 24px 14px;font-size:12px;font-style:italic;font-weight:700;">
      ${INVOICE_COPY.TOTAL_IN_WORDS_PREFIX} *${amountInIndianWords(balance)}*
    </div>

    <div style="padding:6px 24px 22px;border-top:1px solid ${c.border};">
      <div style="font-size:11px;color:${c.muted};font-weight:700;margin-bottom:4px;letter-spacing:0.04em;text-transform:uppercase;">
        ${INVOICE_COPY.TERMS_TITLE}
      </div>
      <ol style="margin:0;padding-left:18px;font-size:10px;line-height:1.5;">
        ${INVOICE_TERMS.map((t) => `<li>${escapeInvoiceHtml(t)}</li>`).join("")}
      </ol>
      <div style="margin-top:28px;max-width:260px;">
        <div style="font-size:11px;color:${c.muted};">${INVOICE_COPY.AUTHORIZED_SIGNATURE}</div>
        <div style="margin-top:22px;border-bottom:1px solid ${c.dark};"></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
