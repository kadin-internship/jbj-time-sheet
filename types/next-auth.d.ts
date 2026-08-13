import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: "admin" | "employee";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    role: "admin" | "employee";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: "admin" | "employee";
  }
}
