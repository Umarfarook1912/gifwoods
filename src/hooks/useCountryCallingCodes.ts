"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api";
import { COUNTRY_CODES_STALE_TIME_MS } from "@/constants/countries";
import { QUERY_KEYS } from "@/constants/query-keys";
import type {
  CountryApiResponse,
  CountryCallingCode,
} from "@/types/country";

function getFlagEmoji(isoCode: string) {
  return isoCode
    .toUpperCase()
    .split("")
    .map((character) => String.fromCodePoint(character.charCodeAt(0) + 127397))
    .join("");
}

async function fetchCountryCallingCodes(): Promise<CountryCallingCode[]> {
  const response = await fetch(API_ENDPOINTS.COUNTRY_CALLING_CODES);
  if (!response.ok) {
    throw new Error("Unable to load country calling codes");
  }

  const payload = (await response.json()) as CountryApiResponse;
  if (payload.error) throw new Error("Unable to load country calling codes");

  return payload.data
    .map((country) => ({
      isoCode: country.code,
      name: country.name,
      flag: getFlagEmoji(country.code),
      callingCode: country.dial_code.replace(/\s/g, ""),
    }))
    .sort((first, second) => first.name.localeCompare(second.name));
}

export function useCountryCallingCodes() {
  return useQuery({
    queryKey: QUERY_KEYS.COUNTRY_CALLING_CODES,
    queryFn: fetchCountryCallingCodes,
    staleTime: COUNTRY_CODES_STALE_TIME_MS,
  });
}
