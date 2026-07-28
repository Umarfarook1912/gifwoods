import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      supabaseId?: string;
      role: string;
      isGuest: boolean;
      authProvider?: string;
      permissions?: string[];
      status?: string;
    };
  }

  interface User {
    isGuest?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    supabaseId?: string;
    role?: string;
    isGuest?: boolean;
    authProvider?: string;
    permissions?: string[];
    status?: string;
  }
}
