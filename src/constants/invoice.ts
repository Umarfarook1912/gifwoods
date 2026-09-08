import { CONTACT_INFO, SITE_NAME } from "@/constants/ui";

/** Legal / tax invoice business details (shown on downloadable invoices). */
export const INVOICE_BUSINESS = {
  legalName: "GifWoods",
  tradeName: SITE_NAME,
  addressLines: [
    "NO.B1, T.S.NO: 3087 V.O.C.NAGAR, 1 ST STREET",
    "THANJAVUR Tamil Nadu 613007, India",
  ],
  gstin: "33ANCPV7722R1ZA",
  state: "Tamil Nadu",
  stateCode: "33",
  email: CONTACT_INFO.email,
  phone: CONTACT_INFO.phoneFormatted,
} as const;

export const INVOICE_BANK = {
  accountName: "GIFWOODS",
  bankName: "Union Bank of India",
  accountNumber: "206511020000001",
  accountType: "Current account",
  ifsc: "UBIN0820652",
  gpayLabel: "G-Pay",
  gpayNumber: "+91 7010969348",
  phonepeLabel: "PhonePe",
  phonepeNumber: "+91 9443563000",
} as const;

/** Intra-state GST split (CGST + SGST) when place of supply is Tamil Nadu. */
export const INVOICE_GST = {
  TOTAL_RATE: 0.18,
  HALF_RATE: 0.09,
  HALF_RATE_LABEL: "9%",
  CGST_LABEL: "CGST",
  SGST_LABEL: "SGST",
  CGST_TOTAL_LABEL: "CGST9 (9%)",
  SGST_TOTAL_LABEL: "SGST9 (9%)",
} as const;

export const INVOICE_COPY = {
  TITLE: "TAX INVOICE",
  BALANCE_DUE: "BALANCE DUE",
  PLACE_OF_SUPPLY: "Place Of Supply",
  TERMS_DUE: "Due on Receipt",
  NOTES_BODY: "Thank you very much for giving us your business.",
  BANK_TITLE: "Thanks for your business.",
  TOTAL_IN_WORDS_PREFIX: "Total In Words:",
  TERMS_TITLE: "Terms & Conditions",
  AUTHORIZED_SIGNATURE: "Authorized Signature",
  PRINT: "Print Invoice",
  CLOSE: "Close Window",
  DIGITAL_LABEL: "Tax Invoice",
  BILL_TO: "Bill To",
  DOWNLOAD_BUTTON: "Download Invoice",
  PRINT_HINT:
    "For PDF download: Print → Save as PDF, and turn on “Background graphics” if the header looks blank.",
} as const;

/** Exact terms from the GifWoods tax invoice reference. */
export const INVOICE_TERMS = [
  "Items sold will not be returned for any reason.",
  "The price in the quotation is valid for five days only.",
  "If the purchased product needs to be individually packaged, the buyer will have to pay for it.",
  "Work will start after 70% advance payment is made.",
  "The goods will be delivered after the remaining 30% percent payment is made.",
] as const;

/** App theme palette for tax invoices (gold / dark / cream). */
export const INVOICE_COLORS = {
  header: "#16130f",
  accent: "#e5a93c",
  accentDark: "#c8882a",
  cream: "#faf7f2",
  muted: "#8b7d6b",
  dark: "#16130f",
  border: "#e8e0d8",
  stripe: "#f4f1ec",
  white: "#ffffff",
} as const;

export const INVOICE_FONTS = {
  GOOGLE_HREF:
    "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;600;700&display=swap",
  DISPLAY: '"Libre Baskerville", Georgia, "Times New Roman", serif',
  BODY: '"Source Sans 3", "Segoe UI", Helvetica, Arial, sans-serif',
} as const;

/** Shared screen + print CSS so Save as PDF matches the browser view. */
export const INVOICE_DOCUMENT_CSS = `
  * { box-sizing: border-box; }
  html, body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  body {
    margin: 0;
    background: #faf7f2;
    color: #16130f;
    font-family: ${INVOICE_FONTS.BODY};
  }
  .toolbar {
    max-width: 920px; margin: 16px auto 0; padding: 12px 16px; background: #ffffff;
    border: 1px solid #e8e0d8; border-radius: 8px; display: flex;
    justify-content: space-between; align-items: center;
  }
  .toolbar button {
    border: 0; border-radius: 999px; padding: 9px 16px; font-weight: 700;
    font-family: ${INVOICE_FONTS.BODY}; cursor: pointer;
  }
  .btn-print { background: #e5a93c; color: #16130f; }
  .btn-close { background: #f4f1ec; color: #16130f; margin-left: 8px; }
  .sheet {
    max-width: 920px; margin: 16px auto 32px; background: #ffffff;
    border: 1px solid #e8e0d8; overflow: visible;
    box-shadow: 0 10px 30px rgba(22,19,15,0.06);
  }
  .display { font-family: ${INVOICE_FONTS.DISPLAY}; }
  .invoice-header {
    background: #16130f !important; color: #ffffff !important;
    padding: 22px 24px; display: table; width: 100%;
    border-bottom: 4px solid #e5a93c !important;
  }
  .invoice-header * { color: inherit; }
  .invoice-header .brand { color: #e5a93c !important; }
  .invoice-header .logo-wrap {
    display: table-cell; vertical-align: middle; width: 140px;
  }
  .invoice-header .logo-box {
    background: #ffffff !important; border-radius: 8px; padding: 6px 8px;
    display: inline-block; text-align: center;
  }
  .invoice-header .logo-box img {
    height: 72px !important; width: auto !important; max-width: 120px !important;
    object-fit: contain; display: block;
  }
  .invoice-header .title-cell {
    display: table-cell; vertical-align: middle; text-align: center;
    font-size: 28px; letter-spacing: 0.1em; font-weight: 700;
    color: #ffffff !important;
  }
  .invoice-header .meta-cell {
    display: table-cell; vertical-align: middle; text-align: right;
    font-size: 11px; line-height: 1.5; width: 250px; color: #ffffff !important;
  }
  .bill-bar {
    background: #f4f1ec !important; padding: 10px 24px;
    display: table; width: 100%;
  }
  .bill-bar .left, .bill-bar .right { display: table-cell; vertical-align: middle; }
  .bill-bar .right { text-align: right; color: #c8882a !important; font-weight: 700; }
  .summary-box {
    margin: 14px 24px 8px; padding: 16px 18px; background: #f4f1ec !important;
    border-radius: 10px; display: table; width: calc(100% - 48px);
  }
  .summary-box .col { display: table-cell; vertical-align: top; width: 50%; }
  .summary-box .col + .col { padding-left: 24px; }
  .table-head {
    background: #faf7f2 !important; border-top: 1px solid #e8e0d8;
    border-bottom: 2px solid #e5a93c !important; color: #c8882a !important;
  }
  @page { size: A4; margin: 10mm; }
  @media print {
    .toolbar { display: none !important; }
    body { background: #ffffff !important; }
    .sheet {
      margin: 0 !important; border: 0 !important; max-width: none !important;
      box-shadow: none !important; width: 100% !important;
    }
    .invoice-header {
      background: #16130f !important; color: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .invoice-header .title-cell,
    .invoice-header .meta-cell { color: #ffffff !important; }
    .invoice-header .brand { color: #e5a93c !important; }
    .bill-bar, .summary-box, .table-head, .invoice-header .logo-box {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
` as const;
