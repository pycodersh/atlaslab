import { after, NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * 무료 샘플 PDF 내려받기 — 한 번 셀 때마다 kp_downloads 에 한 줄 남기고 실제 파일로 보낸다.
 *
 * 주소가 .pdf 로 끝나서 GA4 의 자동 file_download 이벤트(향상된 측정)도 그대로 잡힌다.
 * 실제 파일은 public/assets 의 정적 파일 — 예전 직접 링크(/assets/…pdf)도 계속 열린다(그쪽은 세지 않는다).
 *
 * - source: 어느 버튼에서 왔는지(?src=home|kpatto|blog). 목록 밖 값은 'other', 없으면 'direct'.
 * - 봇 · 크롤러 · 링크 미리보기는 세지 않는다(User-Agent 로 거른다). HEAD 요청도 세지 않는다.
 * - 개인정보는 남기지 않는다(IP · 쿠키 · 이메일 없음).
 * - DB 기록은 after() 로 응답을 보낸 뒤에 한다 — 기록이 실패해도 내려받기는 막지 않는다.
 * 집계: npx tsx scripts/kpatto-download-stats.ts
 */
const FILE = 'k-patto-free-sample-10'
const TARGET = '/assets/K_Patto_Free_Sample_10.pdf'
const SOURCES = new Set(['home', 'kpatto', 'blog'])
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|skype|curl|wget|python|axios|node-fetch|headless|lighthouse|pingdom|uptime|monitor/i

export async function GET(req: NextRequest) {
  const ua = req.headers.get('user-agent') ?? ''
  const raw = req.nextUrl.searchParams.get('src')
  const source = raw ? (SOURCES.has(raw) ? raw : 'other') : 'direct'

  if (ua && !BOT.test(ua)) {
    after(async () => {
      try {
        const { error } = await createAdminClient().from('kp_downloads').insert({ file: FILE, source })
        if (error) console.error('[kp_downloads] insert failed:', error.message)
      } catch (e) {
        console.error('[kp_downloads] insert failed:', e)
      }
    })
  }

  return redirectToFile(req)
}

// HEAD 는 따로 둔다 — 없으면 Next 가 GET 으로 처리해서 링크 확인 · 미리보기 요청까지 세어진다
export function HEAD(req: NextRequest) {
  return redirectToFile(req)
}

function redirectToFile(req: NextRequest) {
  const res = NextResponse.redirect(new URL(TARGET, req.url), 302)
  res.headers.set('Cache-Control', 'no-store')   // 중간 캐시가 리다이렉트를 저장하면 다음 요청이 세어지지 않는다
  res.headers.set('X-Robots-Tag', 'noindex')
  return res
}
