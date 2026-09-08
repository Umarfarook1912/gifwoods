import { roundMoney } from "@/lib/orders/pricing";

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
] as const;

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
] as const;

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  return `${TENS[ten]}${one ? ` ${ONES[one]}` : ""}`.trim();
}

function threeDigits(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ");
}

/** Indian numbering: crore / lakh / thousand for whole rupees. */
export function amountInIndianWords(amount: number): string {
  const rounded = roundMoney(amount);
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  if (rupees === 0 && paise === 0) return "Indian Rupee Zero Only";

  const crore = Math.floor(rupees / 1_00_00_000);
  const lakh = Math.floor((rupees % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((rupees % 1_00_000) / 1000);
  const hundred = rupees % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  let words = `Indian Rupee ${parts.join(" ")}`;
  if (paise > 0) words += ` and ${twoDigits(paise)} Paise`;
  return `${words} Only`;
}
