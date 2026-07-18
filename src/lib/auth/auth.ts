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
        const { error } = await supabase.from("profiles").upsert(
          {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar_url: user.image,
          },
          { onConflict: "email", ignoreDuplicates: false }
        );
        if (error) console.error("Profile sync error:", error.message);
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
