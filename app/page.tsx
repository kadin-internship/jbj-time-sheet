import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user.mustChangePassword) {
    redirect("/change-password");
  }

  if (session?.user.role === "admin") {
    redirect("/admin");
  }

  redirect("/dashboard");
}
