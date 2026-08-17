"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { getUserByUsername } from "@/lib/db/queries/users";

export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  const existing = await getUserByUsername(username);
  if (existing?.lockedUntil && existing.lockedUntil.getTime() > Date.now()) {
    const minutesLeft = Math.ceil((existing.lockedUntil.getTime() - Date.now()) / 60_000);
    return {
      error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
    };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: callbackUrl,
    });
    return { error: null };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Incorrect username or password." };
    }
    throw err;
  }
}
