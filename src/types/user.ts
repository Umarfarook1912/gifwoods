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

