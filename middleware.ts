import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Admin path protection ────────────────────────────────────────────────────
// These paths are blocked in production for non-admin users.
// In local development (VERCEL_ENV is undefined), they remain accessible.
const ADMIN_PATHS = [
  '/admin',
  '/kpatto/editor',
  '/patto/editor',
  '/patto/dev',
  '/api/admin',
]

const IS_PROD = process.env.VERCEL_ENV === 'production'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — do NOT remove this, required for SSR auth to work
  const { data: { user } } = await supabase.auth.getUser()

  // Block admin/debug paths in production for non-admin users
  if (IS_PROD && isAdminPath(request.nextUrl.pathname)) {
    const isAdmin = Boolean(ADMIN_EMAIL) && user?.email === ADMIN_EMAIL
    if (!isAdmin) {
      // Return 404 — do not reveal path existence or redirect (avoids leaking info)
      return new NextResponse(null, { status: 404 })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
