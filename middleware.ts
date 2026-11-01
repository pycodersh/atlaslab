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

// 미들웨어는 페이지가 정적이어도 요청마다 돌고, 돌 때마다 Supabase 세션을 확인한다(Fluid Active CPU).
// 서버에서 로그인 정보를 쓰지 않는 정적 콘텐츠(블로그 · 사이트맵 · 표현 사전 · 오디오)와
// 정적 파일은 건너뛴다. 관리자 경로(ADMIN_PATHS)는 여기에 걸리지 않는다.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|blog|sitemap.xml|robots.txt|kpatto/expressions|audio/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|mp4|wav|json|txt|xml|webmanifest|woff2?)$).*)',
  ],
}
