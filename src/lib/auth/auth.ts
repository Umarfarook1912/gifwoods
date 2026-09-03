import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { hasAdminModuleAccess } from "@/constants/admin-permissions";
import {
  verifyPassword,
  upsertGoogleAuthUser,
} from "@/lib/auth/user-service";
import {
  getUserProfileByEmail,
  upsertUserProfile,
} from "@/lib/db/users";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    Credentials({
      id: "email-password",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const authUser = await verifyPassword(email, password);
        if (!authUser) return null;

        // Check profile status (inactive users are blocked)
        const profile = await getUserProfileByEmail(email);
        if (profile?.status === "inactive") return null;

        return {
          id: authUser.id,
          email: authUser.email,
          name: authUser.name ?? email,
          image: authUser.image ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const email = user.email.toLowerCase().trim();
        const existing = await getUserProfileByEmail(email);

        if (existing) {
          if (existing.status === "inactive") return false;
          // Sync name + avatar
          try {
            await upsertUserProfile({
              id: existing.id,
              name: user.name ?? existing.name ?? email,
              email,
              avatar_url: user.image ?? existing.avatar_url,
            });
          } catch (err) {
            console.error("Profile sync error (google):", err);
          }
        } else {
          // New Google user — create Auth identity and profile
          const supabaseUserId = await upsertGoogleAuthUser(email, {
            name: user.name,
            avatar_url: user.image,
          });

          if (!supabaseUserId) {
            console.error("Google sign-in: could not create/find user");
            return false;
          }

          try {
            await upsertUserProfile({
              id: supabaseUserId,
              name: user.name ?? email,
              email,
              avatar_url: user.image ?? null,
              role: "user",
            });
          } catch (err) {
            console.error("Google profile upsert error:", err);
            return false;
          }
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        token.isGuest = (user as { isGuest?: boolean }).isGuest ?? false;
      }
      if (account) {
        token.authProvider = account.provider;
      }

      const shouldFetchRole =
        !token.isGuest &&
        token.email &&
        (account !== null || trigger === "update" || !token.role);

      if (shouldFetchRole && token.email) {
        const profile = await getUserProfileByEmail(token.email as string);
        if (profile) {
          token.supabaseId = profile.id;
          token.role = profile.role ?? "user";
          token.permissions = profile.permissions ?? [];
          token.status = profile.status ?? "active";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.supabaseId = token.supabaseId as string | undefined;
        session.user.role = (token.role as string) ?? "user";
        session.user.isGuest = (token.isGuest as boolean) ?? false;
        session.user.authProvider = token.authProvider as string | undefined;
        session.user.permissions = (token.permissions as string[]) ?? [];
        session.user.status = (token.status as string) ?? "active";
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
});

export function hasApiPermission(session: any, requiredPermission?: string): boolean {
  if (!session) return false;
  const role = session.user?.role;
  if (role === "super_admin") return true;
  if (role === "admin") {
    if (!requiredPermission) return true;
    return hasAdminModuleAccess(session.user?.permissions, requiredPermission);
  }
  return false;
}
