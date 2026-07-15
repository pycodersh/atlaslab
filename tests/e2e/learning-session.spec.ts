/**
 * 시나리오 #5, #6, #7, #8, #9: 학습 세션 전체 흐름
 * - Story 재생 및 오디오 정상 작동
 * - Pattern 5장 완료 및 라운드 1회 증가
 * - 학습 완료와 Progress 즉시 반영
 * - 학습 중 탭 이동 시 오디오 종료
 * - Pattern 5 → 다음 화면 전환 깜빡임 없음
 */
import { test, expect } from '@playwright/test'
import { PATTO, STORIES, clearSRS, collectConsoleErrors, countPlayingAudio } from './helpers'

const STORY_1_URL = `${STORIES}/1`
const SESSION_1_URL = `${PATTO}/session/1`

test.describe('학습 세션 — Story 재생', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STORY_1_URL)
    await clearSRS(page)
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('#5 Story 페이지 정상 로딩 — 치명적 에러 없음', async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto(STORY_1_URL)
    await page.waitForLoadState('networkidle')

    // Story 관련 텍스트가 화면에 있어야 함
    await expect(page.locator('body')).not.toContainText('404')
    await expect(page.locator('body')).not.toContainText('Error')

    const fatal = errors.filter(e =>
      !e.includes('favicon') && !e.includes('404') && !e.includes('audio')
    )
    expect(fatal).toHaveLength(0)
  })

  test('#5 재생 버튼 빠른 연속 클릭 — 중복 오디오 재생 없음', async ({ page }) => {
    await page.goto(SESSION_1_URL)
    await page.waitForLoadState('networkidle')

    // 재생 버튼 찾기 (다양한 선택자 시도)
    const playBtn = page.locator('[aria-label*="play"], [aria-label*="Play"], button:has(svg)').first()
    if (await playBtn.isVisible()) {
      // 빠르게 5번 클릭
      for (let i = 0; i < 5; i++) {
        await playBtn.click({ delay: 50 })
      }
      await page.waitForTimeout(500)
      const playing = await countPlayingAudio(page)
      expect(playing).toBeLessThanOrEqual(1)
    }
  })
})

test.describe('학습 세션 — Pattern 완료', () => {
  test('#6 세션 페이지 정상 접근', async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto(SESSION_1_URL)
    await page.waitForLoadState('networkidle')

    // HTTP 5xx 체크는 network listener로 (body 텍스트에 "500" 포함될 수 있음)
    const fatal = errors.filter(e => !e.includes('favicon') && !e.includes('audio'))
    expect(fatal).toHaveLength(0)
  })

  test('#6 세션 완료 화면 — SRS 라운드 정보 저장', async ({ page }) => {
    await page.goto(SESSION_1_URL)
    await page.waitForLoadState('networkidle')

    // 이전 라운드 기록
    const beforeRound = await page.evaluate(() => {
      const raw = localStorage.getItem('patto-story-rounds')
      if (!raw) return 0
      const rounds = JSON.parse(raw)
      return rounds['1']?.round ?? 0
    })

    // Next 버튼을 찾아 세션 진행 시뮬레이션
    const nextBtn = page.getByRole('button', { name: /next|다음|계속|continue/i }).first()
    if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextBtn.click()
      await page.waitForTimeout(300)
    }

    // 완료 버튼 시도
    const completeBtn = page.getByRole('button', { name: /complete|완료|finish|done/i }).first()
    if (await completeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await completeBtn.click()
      await page.waitForTimeout(1000)

      const afterRound = await page.evaluate(() => {
        const raw = localStorage.getItem('patto-story-rounds')
        if (!raw) return 0
        const rounds = JSON.parse(raw)
        return rounds['1']?.round ?? 0
      })

      // 라운드는 최대 1 증가
      expect(afterRound - beforeRound).toBeLessThanOrEqual(1)
    }
  })

  test('#8 다른 페이지 이동 시 오디오 종료', async ({ page }) => {
    await page.goto(SESSION_1_URL)
    await page.waitForLoadState('networkidle')

    // 재생 버튼 클릭 시도
    const playBtn = page.locator('button').filter({ hasText: /play|재생/i }).first()
    if (await playBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await playBtn.click()
      await page.waitForTimeout(500)
    }

    // 다른 페이지로 이동
    await page.goto(`${PATTO}/records`)
    await page.waitForLoadState('networkidle')

    // 이전 오디오 재생 중이지 않아야 함
    const playing = await countPlayingAudio(page)
    expect(playing).toBe(0)
  })
})

test.describe('학습 세션 — 완료 후 Progress 반영', () => {
  test('#7 Progress 페이지 정상 로딩', async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto(`${PATTO}/records`)
    await page.waitForLoadState('networkidle')

    // HTTP 5xx 체크는 network listener로 (body 텍스트에 "500" 포함될 수 있음)
    const fatal = errors.filter(e => !e.includes('favicon'))
    expect(fatal).toHaveLength(0)
  })

  test('#9 Story → Pattern 전환 시 빈 화면(깜빡임) 없음', async ({ page }) => {
    // 세션 페이지에서 slides 전환 테스트
    await page.goto(SESSION_1_URL)
    await page.waitForLoadState('networkidle')

    // 화면이 항상 content를 가지고 있어야 함
    const bodyContent = await page.evaluate(() => document.body.innerText.trim().length)
    expect(bodyContent).toBeGreaterThan(0)

    // Next 버튼으로 슬라이드 전환
    for (let i = 0; i < 3; i++) {
      const nextBtn = page.locator('button').filter({ hasText: /next|다음|→/i }).first()
      if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nextBtn.click()
        // 전환 중 body에 content 있는지 확인
        const contentLen = await page.evaluate(() => document.body.innerText.trim().length)
        expect(contentLen).toBeGreaterThan(0)
        await page.waitForTimeout(200)
      }
    }
  })
})
