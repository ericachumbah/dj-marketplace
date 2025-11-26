import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Demo user database
const demoUsers: Record<string, any> = {
  "demo@example.com": {
    id: "1",
    email: "demo@example.com",
    name: "Demo User",
    password: "demo",
    role: "USER",
  },
  "dj@example.com": {
    id: "2",
    email: "dj@example.com",
    name: "Demo DJ",
    password: "demo",
    role: "DJ",
  },
  "admin@example.com": {
    id: "3",
    email: "admin@example.com",
    name: "Admin User",
    password: "demo",
    role: "ADMIN",
  },
};

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

        const user = demoUsers[credentials.email];
        if (!user || user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
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
