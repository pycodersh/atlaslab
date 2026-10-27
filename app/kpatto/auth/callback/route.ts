import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')

  if (oauthError === 'access_denied') {
    return NextResponse.redirect(`${origin}/kpatto/profile`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // 로그인 전에 들르던 앱 화면(예: /kpatto/redeem)이 쿠키로 남아 있으면 그리로 돌려보낸다.
      // 다른 사이트로 튕기지 않게 '/kpatto/' 로 시작하는 경로만 받는다. 없으면 앱 홈 —
      // /kpatto 는 판매 랜딩이라 로그인 직후 도착지로 쓰지 않는다.
      const back = decodeURIComponent(request.headers.get('cookie')?.match(/(?:^|;\s*)kpatto_return_to=([^;]+)/)?.[1] ?? '')
      const dest = /^\/kpatto\/[a-z0-9/_-]*$/i.test(back) ? back : '/kpatto/home'
      const res = NextResponse.redirect(`${origin}${dest}`)
      res.cookies.set('kpatto_return_to', '', { path: '/', maxAge: 0 })
      return res
    }
  }

  return NextResponse.redirect(`${origin}/kpatto/profile?error=auth_failed`)
}
