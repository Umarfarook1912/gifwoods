import { createClient } from "./server";
import fs from "fs/promises";
import path from "path";
import type { Address } from "@/types/user";

const MOCK_DB_PATH = path.join(process.cwd(), "src/lib/supabase/mock-db.json");

interface MockStore {
  addresses: Address[];
}

async function getMockStore(): Promise<MockStore> {
  try {
    const data = await fs.readFile(MOCK_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    const defaultStore: MockStore = { addresses: [] };
    await fs.writeFile(MOCK_DB_PATH, JSON.stringify(defaultStore, null, 2));
    return defaultStore;
  }
}

async function saveMockStore(store: MockStore): Promise<void> {
  await fs.writeFile(MOCK_DB_PATH, JSON.stringify(store, null, 2));
}

// Check if error is table not found
function isTableMissingError(error: any): boolean {
  if (!error) return false;
  // PGRST116 or 42P01
  return error.code === "42P01" || (error.message && error.message.includes("Could not find the table"));
}

export async function getAddresses(userId: string): Promise<Address[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isTableMissingError(error)) {
      console.warn("Supabase 'addresses' table missing, falling back to local JSON store.");
      const store = await getMockStore();
      return store.addresses.filter((a) => a.user_id === userId);
    }
    throw error;
  }

  return (data ?? []) as Address[];
}

export async function createAddress(userId: string, payload: Omit<Address, "id" | "user_id" | "created_at" | "updated_at">): Promise<Address> {
  const supabase = await createClient();
  
  // If is_default_shipping is true, we must unset other default shipping addresses for this user
  if (payload.is_default_shipping) {
    try {
      await supabase.from("addresses").update({ is_default_shipping: false }).eq("user_id", userId);
    } catch {
      // ignore
    }
  }
  // Same for default billing
  if (payload.is_default_billing) {
    try {
      await supabase.from("addresses").update({ is_default_billing: false }).eq("user_id", userId);
    } catch {
      // ignore
    }
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({ ...payload, user_id: userId })
    .select()
    .single();

  if (error) {
    if (isTableMissingError(error)) {
      const store = await getMockStore();
      if (payload.is_default_shipping) {
        store.addresses.forEach((a) => { if (a.user_id === userId) a.is_default_shipping = false; });
      }
      if (payload.is_default_billing) {
        store.addresses.forEach((a) => { if (a.user_id === userId) a.is_default_billing = false; });
      }

      const newAddress: Address = {
        ...payload,
        id: crypto.randomUUID(),
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.addresses.push(newAddress);
      await saveMockStore(store);
      return newAddress;
    }
    throw error;
  }

  return data as Address;
}

export async function updateAddress(
  userId: string,
  addressId: string,
  payload: Partial<Omit<Address, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<Address> {
  const supabase = await createClient();

  if (payload.is_default_shipping) {
    try {
      await supabase.from("addresses").update({ is_default_shipping: false }).eq("user_id", userId);
    } catch {}
  }
  if (payload.is_default_billing) {
    try {
      await supabase.from("addresses").update({ is_default_billing: false }).eq("user_id", userId);
    } catch {}
  }

  const { data, error } = await supabase
    .from("addresses")
    .update(payload)
    .eq("id", addressId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (isTableMissingError(error)) {
      const store = await getMockStore();
      const addressIndex = store.addresses.findIndex((a) => a.id === addressId && a.user_id === userId);
      if (addressIndex === -1) throw new Error("Address not found");

      if (payload.is_default_shipping) {
        store.addresses.forEach((a) => { if (a.user_id === userId) a.is_default_shipping = false; });
      }
      if (payload.is_default_billing) {
        store.addresses.forEach((a) => { if (a.user_id === userId) a.is_default_billing = false; });
      }

      const updated = {
        ...store.addresses[addressIndex],
        ...payload,
        updated_at: new Date().toISOString(),
      };
      store.addresses[addressIndex] = updated;
      await saveMockStore(store);
      return updated;
    }
    throw error;
  }

  return data as Address;
}

export async function deleteAddress(userId: string, addressId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", userId);

  if (error) {
    if (isTableMissingError(error)) {
      const store = await getMockStore();
      const lengthBefore = store.addresses.length;
      store.addresses = store.addresses.filter((a) => !(a.id === addressId && a.user_id === userId));
      await saveMockStore(store);
      return store.addresses.length < lengthBefore;
    }
    throw error;
  }
  return true;
}
