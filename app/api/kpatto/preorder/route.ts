import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * K-PATTO E-Book 출시 알림 신청 — 이메일 한 줄을 kp_preorder_emails 에 넣는다.
 * 같은 이메일을 다시 넣어도 성공으로 본다(중복은 조용히 무시).
 * 테이블: supabase/migrations/20261025_kp_preorder_emails.sql
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: Request) {
  let email = ''
  try {
    const body = await req.json()
    email = String(body?.email ?? '').trim().toLowerCase()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  try {
    const { error } = await createAdminClient()
      .from('kp_preorder_emails')
      .upsert({ email, source: 'purchase-page' }, { onConflict: 'email', ignoreDuplicates: true })
    if (error) {
      console.error('[preorder] insert failed:', error.message)
      return NextResponse.json({ ok: false, error: 'save_failed' }, { status: 500 })
    }
  } catch (e) {
    console.error('[preorder] admin client error:', e)
    return NextResponse.json({ ok: false, error: 'save_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
