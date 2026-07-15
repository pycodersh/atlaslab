/**
 * 시나리오 H: 오디오
 * 핵심: 동시 재생 없음, 상태 일치, 실패 처리
 */
import { test, expect } from '@playwright/test'
import { PATTO, countPlayingAudio, collectConsoleErrors } from './helpers'

const SESSION_1 = `${PATTO}/session/1`

test.describe('오디오 — 중복 재생 방지', () => {
  test('재생 버튼 빠른 연속 클릭 — 동시 재생 없음', async ({ page }) => {
    await page.goto(SESSION_1)
    await page.waitForLoadState('networkidle')

    const playBtn = page.locator('button').filter({ hasText: /play|재생/ }).first()
    if (await playBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      for (let i = 0; i < 5; i++) {
        await playBtn.click({ delay: 80 })
      }
      await page.waitForTimeout(600)
      const count = await countPlayingAudio(page)
      expect(count).toBeLessThanOrEqual(1)
    }
  })

  test('오디오 404 — 무한 로딩 없음', async ({ page }) => {
    // 오디오 파일 404 모킹
    await page.route('**/*.mp3', route => route.fulfill({ status: 404, body: '' }))
    await page.route('**/*.wav', route => route.fulfill({ status: 404, body: '' }))

    await page.goto(SESSION_1)
    await page.waitForLoadState('networkidle')

    // 재생 버튼 클릭
    const playBtn = page.locator('button').filter({ hasText: /play|재생/ }).first()
    if (await playBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await playBtn.click()
      await page.waitForTimeout(2000)

      // 무한 로딩 스피너가 없어야 함 (로딩 인디케이터가 사라져야 함)
      const spinner = page.locator('[aria-label*="loading"], [class*="spinner"], [class*="loading"]').first()
      const isSpinning = await spinner.isVisible({ timeout: 500 }).catch(() => false)
      if (isSpinning) {
        // 5초 내 스피너 사라져야 함
        await expect(spinner).not.toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('페이지 이동 후 오디오 자동 종료', async ({ page }) => {
    await page.goto(SESSION_1)
    await page.waitForLoadState('networkidle')

    const playBtn = page.locator('button').filter({ hasText: /play|재생/ }).first()
    if (await playBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await playBtn.click()
      await page.waitForTimeout(500)
    }

    await page.goto(`${PATTO}/records`)
    await page.waitForLoadState('networkidle')

    const playing = await countPlayingAudio(page)
    expect(playing).toBe(0)
  })

  test('새로고침 후 오디오 자동 종료', async ({ page }) => {
    await page.goto(SESSION_1)
    await page.waitForLoadState('networkidle')

    const playBtn = page.locator('button').filter({ hasText: /play|재생/ }).first()
    if (await playBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await playBtn.click()
      await page.waitForTimeout(300)
    }

    await page.reload()
    await page.waitForLoadState('networkidle')

    const playing = await countPlayingAudio(page)
    expect(playing).toBe(0)
  })
})
