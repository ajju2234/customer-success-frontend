import { NextRequest, NextResponse } from "next/server";

// Soft route-gate: redirect unauthenticated users (no refresh cookie) away from
// protected pages, and signed-in users away from auth pages. Real authorization
// is always enforced server-side by the API.
const PUBLIC_PATHS = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has("refresh_token");
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  // Run on app pages only (exclude next internals + static assets).
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
