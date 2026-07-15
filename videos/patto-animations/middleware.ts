import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "patto_auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow auth routes and API routes
  if (pathname.startsWith("/auth") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const password = process.env.SITE_PASSWORD ?? "patto2024";

  // Check cookie
  const cookie = req.cookies.get(COOKIE);
  if (cookie?.value === password) return NextResponse.next();

  // Redirect to auth
  const url = req.nextUrl.clone();
  url.pathname = "/auth";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
