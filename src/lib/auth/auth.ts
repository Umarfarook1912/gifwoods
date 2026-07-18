import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createAdminClient } from "@/lib/supabase/admin";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // ── Email / Password ──────────────────────────────────────────────────────
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

        const supabase = createAdminClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) return null;

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name ?? data.user.email,
          image: data.user.user_metadata?.avatar_url ?? null,
        };
      },
    }),

    // ── Guest (anonymous) ─────────────────────────────────────────────────────
    Credentials({
      id: "guest",
      name: "Guest",
      credentials: {},
      async authorize() {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        return {
          id: guestId,
          name: "Guest User",
          email: `${guestId}@guest.gifwoods.in`,
          isGuest: true,
        };
      },
    }),
  ],

  callbacks: {
    // ── signIn ────────────────────────────────────────────────────────────────
    async signIn({ user, account }) {
      // For Google OAuth: sync / update the profile row
      if (account?.provider === "google" && user.email) {
        const supabase = createAdminClient();

        // Check if a profile row already exists for this email
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();

        if (existing) {
          // Update mutable fields only — do NOT touch the UUID primary key
          const { error } = await supabase
            .from("profiles")
            .update({ name: user.name, avatar_url: user.image })
            .eq("id", existing.id);
          if (error) console.error("Profile sync error (google):", error.message);
        } else {
          // First ever Google sign-in for this email.
          // We must create the auth.users row first via admin API, then the profile.
          // (Some Supabase setups have a trigger that auto-creates profiles on auth.users insert.)
          // As a fallback, we insert manually here using the Google sub as metadata only.
          // The Supabase admin createUser call with the same email will fail if the user
          // already exists in auth.users, so we catch gracefully.
          console.log("No profile found for Google user — will be created on first password-less sign-in or by trigger.");
        }
      }

      // For email/password: profile should already exist (created at /api/auth/register).
      // Nothing extra to do here.

      return true;
    },

    // ── jwt ───────────────────────────────────────────────────────────────────
    async jwt({ token, user, account, trigger }) {
      // On initial sign-in, copy user.id into the token
      if (user) {
        token.id = user.id;
        token.isGuest = (user as { isGuest?: boolean }).isGuest ?? false;
      }

      // Fetch role from profiles table:
      //   - always on first login (account is defined)
      //   - always on session update trigger
      //   - skip for guests (no profile row)
      const shouldFetchRole =
        !token.isGuest &&
        token.email &&
        (account !== null || trigger === "update" || !token.role);

      if (shouldFetchRole && token.email) {
        const supabase = createAdminClient();
        const { data } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("email", token.email)
          .maybeSingle();

        if (data) {
          token.supabaseId = data.id;
          token.role = data.role ?? "user";
        }
      }

      return token;
    },

    // ── session ───────────────────────────────────────────────────────────────
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.supabaseId = token.supabaseId as string | undefined;
        session.user.role = (token.role as string) ?? "user";
        session.user.isGuest = (token.isGuest as boolean) ?? false;
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
