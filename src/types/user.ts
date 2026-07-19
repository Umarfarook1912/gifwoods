export type UserRole = "user" | "admin";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuestUser {
  id: string;
  isGuest: true;
}

export interface AdminUserFilters {
  role?: UserRole;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  street_address: string;
  apartment?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedPaymentMethod {
  id: string;
  user_id: string;
  provider: string;
  method_type: string;
  last4?: string | null;
  brand?: string | null;
  upi_id?: string | null;
  wallet_name?: string | null;
  expiry_month?: number | null;
  expiry_year?: number | null;
  token: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

