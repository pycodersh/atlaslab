import type { Metadata } from 'next'
import { NOINDEX_FOLLOW } from '@/lib/seo/noindex'
import { RedeemClient } from './RedeemClient'

export const metadata: Metadata = {
  title: 'Unlock K-PATTO — Enter your license key',
  ...NOINDEX_FOLLOW,
}

/** Gumroad 에서 WebApp Pass · Bundle 을 산 사람이 라이선스 키로 앱을 여는 화면 */
export default function RedeemPage() {
  return <RedeemClient />
}
