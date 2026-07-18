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
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const supabase = createAdminClient();
        // Look up the profile by email — the row's `id` is a UUID managed by
        // Supabase (FK → auth.users) so we must NOT insert with Google's OAuth id.
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();

        if (existing) {
          // Row already exists — update mutable fields only.
          const { error } = await supabase
            .from("profiles")
            .update({ name: user.name, avatar_url: user.image })
            .eq("id", existing.id);
          if (error) console.error("Profile sync error:", error.message);
        }
        // If no row exists yet, Supabase's own trigger creates it on first
        // sign-up via Supabase Auth. Nothing to do here.
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.isGuest = (user as { isGuest?: boolean }).isGuest ?? false;
      }
      if (account?.provider === "google" && token.email) {
        const supabase = createAdminClient();
        const { data } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("email", token.email)
          .single();
        if (data) {
          token.supabaseId = data.id;
          token.role = data.role;
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
