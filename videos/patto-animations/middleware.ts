import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PASSWORD = process.env.SITE_PASSWORD ?? "patto2024";
const COOKIE = "patto_auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth in development
  if (process.env.NODE_ENV === "development") return NextResponse.next();

  // Allow auth route
  if (pathname === "/auth") return NextResponse.next();

  // Check cookie
  const cookie = req.cookies.get(COOKIE);
  if (cookie?.value === PASSWORD) return NextResponse.next();

  // Redirect to auth
  const url = req.nextUrl.clone();
  url.pathname = "/auth";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
