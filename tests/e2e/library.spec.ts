/**
 * 시나리오 #10: 패턴·단어 저장과 Library 반영
 * (출시 차단 #10)
 */
import { test, expect } from '@playwright/test'
import { PATTO, collectConsoleErrors, collectNetworkErrors, checkNoHorizontalScroll } from './helpers'

const LIBRARY = `${PATTO}/library`
const STORY_1 = `${PATTO}/stories/1`

test.describe('Library — 저장 및 표시', () => {
  test('#10 Library 페이지 정상 로딩', async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto(LIBRARY)
    await page.waitForLoadState('networkidle')

    // HTTP 5xx 체크는 network listener로
    await expect(page.locator('body')).not.toContainText('Error')

    const fatal = errors.filter(e => !e.includes('favicon') && !e.includes('404'))
    expect(fatal).toHaveLength(0)
  })

  test('#10 Library 모바일 가로 스크롤 없음', async ({ page }) => {
    await page.goto(LIBRARY)
    await page.waitForLoadState('networkidle')
    const ok = await checkNoHorizontalScroll(page)
    expect(ok).toBe(true)
  })

  test('#10 Story 페이지에서 패턴 저장 시도', async ({ page }) => {
    const netErrors = collectNetworkErrors(page)
    await page.goto(STORY_1)
    await page.waitForLoadState('networkidle')

    // 저장(북마크) 버튼 찾기
    const saveBtn = page.locator('[aria-label*="save"], [aria-label*="bookmark"], button:has-text("저장")').first()
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click()
      await page.waitForTimeout(500)

      // 5xx 에러 없음
      const serverErrors = netErrors.filter(e => e.status >= 500)
      expect(serverErrors).toHaveLength(0)
    }
  })

  test('#10 중복 저장 — localStorage에 중복 없음', async ({ page }) => {
    await page.goto(STORY_1)
    await page.waitForLoadState('networkidle')

    const saveBtn = page.locator('[aria-label*="save"], [aria-label*="bookmark"], button:has-text("저장")').first()
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      // 두 번 클릭
      await saveBtn.click()
      await page.waitForTimeout(300)
      await saveBtn.click()
      await page.waitForTimeout(300)

      // localStorage에 패턴 중복 없는지 확인
      const duplicates = await page.evaluate(() => {
        const keys = Object.keys(localStorage)
        const patternKey = keys.find(k => k.includes('bookmark') || k.includes('saved'))
        if (!patternKey) return false
        const data = JSON.parse(localStorage.getItem(patternKey) || '[]')
        const ids = data.map((d: { id?: string }) => d?.id).filter(Boolean)
        return ids.length !== new Set(ids).size
      })
      expect(duplicates).toBe(false)
    }
  })
})
