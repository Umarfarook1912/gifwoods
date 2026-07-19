"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { Address } from "@/types/user";

async function fetchSavedAddresses(): Promise<Address[]> {
  const response = await fetch(API_ENDPOINTS.PROFILE_ADDRESSES);
  const result = await response.json();
  if (!response.ok || result.error) {
    throw new Error(result.error ?? "Unable to load saved addresses");
  }
  return result.data ?? [];
}

export function useSavedAddresses(enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.SAVED_ADDRESSES,
    queryFn: fetchSavedAddresses,
    enabled,
    staleTime: 60_000,
  });
}
