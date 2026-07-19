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
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const supabase = createAdminClient();
        const email = user.email.toLowerCase().trim();

        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from("profiles")
            .update({ name: user.name, avatar_url: user.image })
            .eq("id", existing.id);
          if (error) console.error("Profile sync error (google):", error.message);
        } else {
          let supabaseUserId: string | null = null;

          const { data: created, error: createError } =
            await supabase.auth.admin.createUser({
              email,
              email_confirm: true,
              user_metadata: {
                name: user.name,
                full_name: user.name,
                avatar_url: user.image,
              },
            });

          if (created?.user?.id) {
            supabaseUserId = created.user.id;
          } else {
            const { data: linkData } = await supabase.auth.admin.generateLink({
              type: "magiclink",
              email,
            });
            supabaseUserId = linkData?.user?.id ?? null;
            if (createError) {
              console.error("Google createUser:", createError.message);
            }
          }

          if (!supabaseUserId) {
            console.error("Google sign-in: could not create/find Supabase user");
            return false;
          }

          const { error: profileError } = await supabase.from("profiles").upsert(
            {
              id: supabaseUserId,
              name: user.name ?? email,
              email,
              avatar_url: user.image ?? null,
              role: "user",
            },
            { onConflict: "id", ignoreDuplicates: false }
          );

          if (profileError) {
            console.error("Google profile upsert error:", profileError.message);
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

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.supabaseId = token.supabaseId as string | undefined;
        session.user.role = (token.role as string) ?? "user";
        session.user.isGuest = (token.isGuest as boolean) ?? false;
        session.user.authProvider = token.authProvider as string | undefined;
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
