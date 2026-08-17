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

  // "/" is excluded here and instead redirects via app/page.tsx's own redirect(). A raw
  // NextResponse.redirect() issued from here doesn't reliably update the browser's URL when
  // the request is the client router's soft-navigation fetch immediately following a Server
  // Action redirect (e.g. right after login) — it's followed as a transparent HTTP redirect at
  // the fetch layer rather than a real top-level navigation, so the address bar never updates.
  // A full top-level navigation to any other protected path is unaffected and still redirects.
  if (user?.mustChangePassword && pathname !== "/change-password" && pathname !== "/") {
    return NextResponse.redirect(new URL("/change-password", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.webmanifest).*)",
  ],
};
