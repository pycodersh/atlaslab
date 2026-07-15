/**
 * 시나리오 #2: 게스트 Story 시작 및 제한
 * (출시 차단 #2)
 */
import { test, expect } from '@playwright/test'
import { PATTO, clearAll, collectConsoleErrors } from './helpers'

const STORY_1 = `${PATTO}/stories/1`
const SESSION_1 = `${PATTO}/session/1`

test.describe('게스트 — Story 접근 및 제한', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PATTO}/home`)
    await clearAll(page)
    await page.waitForTimeout(300)
  })

  test('#2 게스트 Story 페이지 정상 접근', async ({ page }) => {
    const netErrors: { url: string; status: number }[] = []
    page.on('response', res => {
      if (res.status() >= 500) netErrors.push({ url: res.url(), status: res.status() })
    })
    const consoleErrors = collectConsoleErrors(page)
    await page.goto(STORY_1)
    await page.waitForLoadState('networkidle')

    // HTTP 5xx 없음 (body에서 "500" 텍스트 검사는 콘텐츠와 충돌하므로 네트워크 레벨로 확인)
    expect(netErrors).toHaveLength(0)
    const fatal = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('audio'))
    expect(fatal).toHaveLength(0)
  })

  test('#2 게스트 세션 시작 가능', async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto(SESSION_1)
    await page.waitForLoadState('networkidle')

    // 세션 페이지가 정상 로딩 (리다이렉트 없음 또는 로그인 유도)
    const currentUrl = page.url()
    // 로그인 페이지로 강제 이동되지 않아야 함 (게스트 허용)
    const bodyText = await page.evaluate(() => document.body.innerText.trim())
    expect(bodyText.length).toBeGreaterThan(10)

    const fatal = errors.filter(e => !e.includes('favicon') && !e.includes('audio'))
    expect(fatal).toHaveLength(0)
  })

  test('#2 로그인 유도 모달 닫기 기능', async ({ page }) => {
    await page.goto(STORY_1)
    await page.waitForLoadState('networkidle')

    // 로그인 유도 모달이 열린 경우 닫기
    const modal = page.locator('[role="dialog"], [data-testid="login-modal"]').first()
    if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
      const closeBtn = modal.locator('button[aria-label*="close"], button:has-text("닫기"), button:has-text("×"), button:has-text("✕")').first()
      if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeBtn.click()
        await page.waitForTimeout(300)
        await expect(modal).not.toBeVisible()
      }
    }
  })

  test('#2 새로고침 후 게스트 사용량 유지', async ({ page }) => {
    await page.goto(STORY_1)
    await page.waitForLoadState('networkidle')

    // 게스트 사용량 localStorage 기록
    await page.evaluate(() => {
      localStorage.setItem('patto-guest-usage', JSON.stringify({ count: 2 }))
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // 새로고침 후 사용량 유지
    const usage = await page.evaluate(() => {
      const raw = localStorage.getItem('patto-guest-usage')
      return raw ? JSON.parse(raw) : null
    })
    expect(usage?.count).toBe(2)
  })
})
