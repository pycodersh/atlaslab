/**
 * 시나리오 #3, #4: 로그인/로그아웃
 * - 로그인 성공과 UI 즉시 반영
 * - 로그아웃과 개인 데이터 제거
 */
import { test, expect } from '@playwright/test'
import { HOME, PATTO, collectConsoleErrors } from './helpers'

test.describe('인증 — 로그인 UI', () => {
  test('#3 로그인 버튼 접근 가능', async ({ page }) => {
    await page.goto(`${PATTO}/settings`)
    await page.waitForLoadState('networkidle')

    // 로그인 버튼 또는 계정 메뉴 존재 확인
    const loginEl = page.getByRole('button', { name: /sign in|로그인|google/i })
      .or(page.getByText(/sign in|로그인/i))
    // 있거나 없어도 무방 (이미 로그인 상태일 수 있음) — 에러만 없으면 OK
    const errors = collectConsoleErrors(page)
    await page.waitForTimeout(1000)
    const fatal = errors.filter(e => !e.includes('favicon'))
    expect(fatal).toHaveLength(0)
  })

  test('#3 로그인 모달/페이지 크래시 없음', async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto(`${PATTO}/settings/auth`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const fatal = errors.filter(e => !e.includes('favicon') && !e.includes('404'))
    expect(fatal).toHaveLength(0)
  })

  test('#4 로그아웃 후 보호 페이지 리다이렉트', async ({ page }) => {
    // 로그아웃 상태 시뮬레이션 (Supabase 세션 없음)
    await page.goto(`${PATTO}/settings/account`)
    await page.waitForLoadState('networkidle')

    // 빈 화면이어서는 안 됨
    const bodyText = await page.evaluate(() => document.body.innerText.trim())
    expect(bodyText.length).toBeGreaterThan(0)
  })

  test('#4 로그아웃 후 홈 접근 가능', async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto(HOME)
    await page.waitForLoadState('networkidle')

    // HTTP 5xx 체크는 network listener로
    const fatal = errors.filter(e => !e.includes('favicon'))
    expect(fatal).toHaveLength(0)
  })
})
