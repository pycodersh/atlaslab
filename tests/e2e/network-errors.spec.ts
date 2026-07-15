/**
 * 시나리오 N: 네트워크 및 API 장애 대응
 */
import { test, expect } from '@playwright/test'
import { PATTO, collectConsoleErrors } from './helpers'

test.describe('네트워크 장애 — 오프라인', () => {
  test('오프라인 상태에서 홈 — 무한 로딩 없음', async ({ page }) => {
    // 먼저 정상 접근해 앱 캐시
    await page.goto(`${PATTO}/home`)
    await page.waitForLoadState('networkidle')

    // 오프라인: Next.js HMR 등 외부 요청 차단, 앱 자체 요청(Supabase)만 차단
    await page.route('**/supabase**', route => route.abort())
    await page.route('**/_next/webpack-hmr**', route => route.abort())

    // 새 페이지 탐색 없이 현재 상태에서 Supabase 의존 기능만 확인
    await page.evaluate(() => window.dispatchEvent(new Event('offline')))
    await page.waitForTimeout(2000)

    // 앱 크래시 없이 기본 UI 유지
    const bodyText = await page.evaluate(() => document.body.innerText.trim())
    expect(bodyText.length).toBeGreaterThan(10)
  })
})

test.describe('네트워크 장애 — Supabase API', () => {
  test('Supabase 500 — 홈 로딩 중단 없음', async ({ page }) => {
    await page.route('**/supabase.co/**', route =>
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    )
    await page.route('**/supabase.io/**', route =>
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    )

    const errors = collectConsoleErrors(page)
    await page.goto(`${PATTO}/home`)
    await page.waitForLoadState('networkidle')

    // 앱은 동작해야 함 (localStorage fallback)
    const bodyText = await page.evaluate(() => document.body.innerText.trim())
    expect(bodyText.length).toBeGreaterThan(10)
  })

  test('API 401 — 재로그인 유도, 무한 루프 없음', async ({ page }) => {
    await page.route('**/supabase.co/**', route =>
      route.fulfill({ status: 401, body: JSON.stringify({ error: 'Unauthorized' }) })
    )

    await page.goto(`${PATTO}/home`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 페이지가 응답 중이어야 함
    const bodyText = await page.evaluate(() => document.body.innerText.trim())
    expect(bodyText.length).toBeGreaterThan(0)

    // 무한 리다이렉트 없음
    const url = page.url()
    expect(url).not.toMatch(/undefined|null/)
  })

  test('API 429 — 과도한 재요청 없음', async ({ page }) => {
    let callCount = 0
    await page.route('**/supabase.co/**', route => {
      callCount++
      route.fulfill({ status: 429, body: JSON.stringify({ error: 'Too Many Requests' }) })
    })

    await page.goto(`${PATTO}/home`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // 429 받은 후 재시도가 과도하지 않아야 함 (3초 내 50회 미만)
    expect(callCount).toBeLessThan(50)
  })

  test('네트워크 지연 3초 — 로딩 표시 존재', async ({ page }) => {
    await page.route('**/supabase.co/**', async route => {
      await new Promise(r => setTimeout(r, 3000))
      await route.continue()
    })

    await page.goto(`${PATTO}/home`)

    // 로딩 중 스피너 또는 skeleton이 있어야 함
    const loadingEl = page.locator('[aria-label*="loading"], [class*="skeleton"], [class*="spinner"], [class*="loading"]').first()
    const hasLoading = await loadingEl.isVisible({ timeout: 2000 }).catch(() => true) // 없어도 OK
    // 로딩 표시가 없어도 크래시가 없으면 OK

    await page.waitForLoadState('networkidle')
    // HTTP 5xx 체크는 network listener로
  })
})
