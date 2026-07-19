import type { CountryCallingCode } from "@/types/country";

export const DEFAULT_COUNTRY_ISO = "IN";
export const DEFAULT_CALLING_CODE = "+91";
export const COUNTRY_CODES_STALE_TIME_MS = 24 * 60 * 60 * 1000;

export const FALLBACK_COUNTRY_CALLING_CODES: CountryCallingCode[] = [
  {
    isoCode: DEFAULT_COUNTRY_ISO,
    name: "India",
    flag: "🇮🇳",
    callingCode: DEFAULT_CALLING_CODE,
  },
];
