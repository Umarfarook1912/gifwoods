/**
 * DB service — Addresses
 *
 * TODAY:  wraps Supabase PostgREST queries
 * LATER:  swap internals to pool.query() — callers stay unchanged
 */
import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/types/user";

export async function getAddresses(userId: string): Promise<Address[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Address[];
}

export async function createAddress(
  userId: string,
  payload: Omit<Address, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Address> {
  const supabase = await createClient();

  if (payload.is_default_shipping) {
    await supabase
      .from("addresses")
      .update({ is_default_shipping: false })
      .eq("user_id", userId);
  }
  if (payload.is_default_billing) {
    await supabase
      .from("addresses")
      .update({ is_default_billing: false })
      .eq("user_id", userId);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({ ...payload, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as Address;
}

export async function updateAddress(
  userId: string,
  addressId: string,
  payload: Partial<Omit<Address, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<Address> {
  const supabase = await createClient();

  if (payload.is_default_shipping) {
    await supabase
      .from("addresses")
      .update({ is_default_shipping: false })
      .eq("user_id", userId);
  }
  if (payload.is_default_billing) {
    await supabase
      .from("addresses")
      .update({ is_default_billing: false })
      .eq("user_id", userId);
  }

  const { data, error } = await supabase
    .from("addresses")
    .update(payload)
    .eq("id", addressId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Address;
}

export async function deleteAddress(userId: string, addressId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}
