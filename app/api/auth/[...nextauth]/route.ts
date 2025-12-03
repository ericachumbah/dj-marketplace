import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials.email }).lean();

          if (!user || !user.password) {
            return null;
          }

          // Check if email is verified (skip in development for easier testing)
          if (!user.emailVerified && process.env.NODE_ENV === "production") {
            throw new Error("Please verify your email before signing in");
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as string) || "USER";
      }
      return session;
    },

    async redirect({ url, baseUrl, token }) {
      // If no token, redirect to home
      if (!token) {
        return baseUrl;
      }

      // Extract locale from url if present
      const urlObj = new URL(url, baseUrl);
      const pathname = urlObj.pathname;
      const locale = pathname.split("/")[1] || "en";

      // Redirect DJs to their dashboard
      if (token.role === "DJ") {
        return `${baseUrl}/${locale}/dj/dashboard`;
      }

      // Redirect admins to their dashboard
      if (token.role === "ADMIN") {
        return `${baseUrl}/${locale}/admin`;
      }

      // For other users, handle the redirect URL
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
