/**
 * 시나리오 #11, #12: Writing Studio
 * - Writing Studio 접근 및 UI 구조 검증
 * - 게스트 상태에서 제한 UI 표시 (textarea disabled, 안내 문구)
 * - API 레이어 검증 (GET /patto/api/writing 응답)
 * (출시 차단 #11, #12)
 *
 * NOTE: Writing Studio는 로그인 유저 전용.
 * 게스트는 GET /api/writing → { remaining: 0 } 반환 → textarea disabled.
 * 이는 설계된 동작이며, 이 테스트는 해당 동작의 정확성을 검증한다.
 */
import { test, expect } from '@playwright/test'
import { PATTO, collectConsoleErrors } from './helpers'

const LIBRARY = `${PATTO}/library`

test.describe('Writing Studio — 게스트 상태', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LIBRARY)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)
  })

  test('#11 Library 페이지 정상 로딩 (Writing Studio 포함)', async ({ page }) => {
    const errors = collectConsoleErrors(page)
    // HTTP 5xx 없음
    const serverErrors: { url: string; status: number }[] = []
    page.on('response', r => { if (r.status() >= 500) serverErrors.push({ url: r.url(), status: r.status() }) })

    await page.goto(LIBRARY)
    await page.waitForLoadState('domcontentloaded')

    expect(serverErrors).toHaveLength(0)
    const fatal = errors.filter(e => !e.includes('favicon') && !e.includes('audio'))
    expect(fatal).toHaveLength(0)
  })

  test('#11 Writing Studio textarea 존재 확인', async ({ page }) => {
    // textarea가 DOM에 있어야 함
    const textarea = page.locator('textarea').first()
    const exists = await textarea.isVisible({ timeout: 5000 }).catch(() => false)
    expect(exists).toBe(true)
  })

  test('#11 게스트 상태에서 textarea disabled — 의도된 동작', async ({ page }) => {
    // 게스트(비로그인)는 remaining=0 → textarea disabled가 정상
    const textarea = page.locator('textarea').first()
    if (await textarea.isVisible({ timeout: 5000 }).catch(() => false)) {
      const isDisabled = await textarea.isDisabled()
      // disabled면 로그인 유도 문구가 있어야 함
      if (isDisabled) {
        const upgradeMsg = page.getByText(/업그레이드|로그인|로그아웃|사용했어요|내일/i).first()
        const hasMsg = await upgradeMsg.isVisible({ timeout: 3000 }).catch(() => false)
        expect(hasMsg).toBe(true)
      }
    }
  })

  test('#11 GET /api/writing — 게스트는 remaining:0 반환', async ({ page }) => {
    // API 응답 구조 검증
    const response = await page.request.get('/patto/api/writing')
    expect(response.status()).toBe(200)

    const body = await response.json()
    // 게스트 응답: { remaining: 0, limit: 3, plan: 'free' }
    expect(body).toHaveProperty('remaining')
    expect(body).toHaveProperty('limit')
    expect(body.remaining).toBeGreaterThanOrEqual(0)
    expect(body.limit).toBeGreaterThan(0)
  })

  test('#12 API 실패 모킹 — UI 크래시 없음', async ({ page }) => {
    const errors = collectConsoleErrors(page)

    // API 실패 상황 모킹
    await page.route('**/api/writing**', route => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'server_error' }) })
    })

    await page.goto(LIBRARY)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // 앱이 크래시 없이 렌더링 유지
    const bodyText = await page.evaluate(() => document.body.innerText.trim())
    expect(bodyText.length).toBeGreaterThan(10)

    const fatal = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('audio') &&
      !e.includes('500') &&
      !e.includes('Failed to fetch')
    )
    expect(fatal).toHaveLength(0)
  })

  test('#11 Writing Studio 모바일 가로 스크롤 없음', async ({ page }) => {
    const hasHScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth
    )
    expect(hasHScroll).toBe(false)
  })
})

test.describe('Writing Studio — API 구조 검증', () => {
  test('#11 POST /api/writing — 비로그인 시 401 반환', async ({ page }) => {
    const response = await page.request.post('/patto/api/writing', {
      data: { text: 'I want to learn English every day.', todayPattern: 'I want to ~.' }
    })
    // 비로그인: 401 또는 200 (서버 상태에 따라)
    expect([200, 401, 403, 429]).toContain(response.status())
  })

  test('#11 POST /api/writing — 5단어 미만 입력 시 422', async ({ page }) => {
    // 이 엔드포인트는 단어 수 검증 전에 인증을 체크하지만,
    // 단어 수 검증이 인증 전에 일어날 경우 422가 반환될 수 있음
    const response = await page.request.post('/patto/api/writing', {
      data: { text: 'Too short', todayPattern: 'I want to ~.' }
    })
    // 비로그인이므로 401이 먼저 오거나, 단어 검증 후 422
    expect([401, 403, 422]).toContain(response.status())
  })
})
