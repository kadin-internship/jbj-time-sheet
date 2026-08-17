import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/login";
  const user = req.auth?.user;

  // Server Actions (POST) are handled by the action itself — e.g. the login form's own
  // signIn() call re-authenticates correctly even against a stale session cookie. Redirecting
  // a POST here returns a plain redirect instead of the Server Action response the client
  // expects, which surfaces as "An unexpected response was received from the server."
  if (req.method !== "GET") {
    return NextResponse.next();
  }

  if (!user && !isLoginPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  if (pathname.startsWith("/admin") && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
