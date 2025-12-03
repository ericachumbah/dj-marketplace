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

    async redirect({ url, baseUrl }) {
      // Use a default baseUrl if not provided (during build)
      const safeBaseUrl = baseUrl || "https://mix-factory.vercel.app";
      
      try {
        // Parse the URL
        const urlObj = new URL(url, safeBaseUrl);
        
        // Allow callback URLs from the same origin
        if (urlObj.origin !== safeBaseUrl) {
          return safeBaseUrl;
        }

        return url;
      } catch (error) {
        // If URL parsing fails, return baseUrl
        console.error("URL redirect error:", error);
        return safeBaseUrl;
      }
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
