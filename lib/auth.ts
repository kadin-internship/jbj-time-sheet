import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByUsername, recordFailedLogin, resetFailedLogin } from "@/lib/db/queries/users";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        const username = credentials?.username;
        const password = credentials?.password;
        if (typeof username !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await getUserByUsername(username);
        if (!user || !user.active) {
          return null;
        }

        if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
          await recordFailedLogin(user.id);
          return null;
        }

        await resetFailedLogin(user.id);

        return {
          id: user.id,
          name: user.fullName,
          username: user.username,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.username = (user as { username: string }).username;
        token.role = (user as { role: "admin" | "employee" }).role;
        token.mustChangePassword = (user as { mustChangePassword: boolean }).mustChangePassword;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.username = token.username as string;
      session.user.role = token.role as "admin" | "employee";
      session.user.mustChangePassword = token.mustChangePassword as boolean;
      return session;
    },
  },
});
