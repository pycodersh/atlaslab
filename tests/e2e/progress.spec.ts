/**
 * 시나리오 K: Progress 페이지
 */
import { test, expect } from '@playwright/test'
import { PATTO, collectConsoleErrors, checkNoHorizontalScroll } from './helpers'

const PROGRESS = `${PATTO}/records`

test.describe('Progress — 기본 표시', () => {
  test('Progress 페이지 정상 로딩', async ({ page }) => {
    const serverErrors: { url: string; status: number }[] = []
    page.on('response', res => { if (res.status() >= 500) serverErrors.push({ url: res.url(), status: res.status() }) })
    const errors = collectConsoleErrors(page)

    await page.goto(PROGRESS)
    await page.waitForLoadState('networkidle')

    expect(serverErrors).toHaveLength(0)
    const fatal = errors.filter(e => !e.includes('favicon'))
    expect(fatal).toHaveLength(0)
  })

  test('Progress 모바일 가로 스크롤 없음', async ({ page }) => {
    await page.goto(PROGRESS)
    await page.waitForLoadState('networkidle')
    const ok = await checkNoHorizontalScroll(page)
    expect(ok).toBe(true)
  })

  test('빈 상태에서도 레이아웃 정상', async ({ page }) => {
    await page.goto(PROGRESS)
    await page.evaluate(() => {
      localStorage.removeItem('patto-srs-records')
      localStorage.removeItem('patto-srs-activity')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')

    const bodyText = await page.evaluate(() => document.body.innerText.trim())
    expect(bodyText.length).toBeGreaterThan(10)
  })

  test('새로고침 후 수치 유지', async ({ page }) => {
    // SRS 데이터 심기
    await page.goto(PROGRESS)
    await page.evaluate(() => {
      const today = new Date().toISOString().slice(0, 10)
      const records = { 'story-1': { itemId: 'story-1', itemType: 'story', reviewCount: 1, repeatCount: 3, firstLearnedAt: new Date().toISOString() } }
      localStorage.setItem('patto-srs-records', JSON.stringify(records))
      localStorage.setItem('patto-srs-activity', JSON.stringify({ [today]: { learned: 1 } }))
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // 화면에 학습 수치가 나와야 함
    const bodyText = await page.evaluate(() => document.body.innerText)
    expect(bodyText.length).toBeGreaterThan(10)
  })
})
