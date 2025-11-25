import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role: "USER" | "DJ" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "USER" | "DJ" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "DJ" | "ADMIN";
  }
}
