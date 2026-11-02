import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

/**
 * 홈으로 돌아가는 원형 버튼 — 하단 탭(BottomNav)을 없앤 뒤 Recipes·Saved·Essentials 화면의 길잡이.
 * history.back 이 아니라 홈 링크라서 외부에서 바로 들어온 사용자도 홈으로 간다.
 */
export default function HomeLink() {
  return (
    <Link
      href="/kpantry/en"
      aria-label="Home"
      style={{
        width: 36,
        height: 36,
        flexShrink: 0,
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--kp-rule)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ChevronLeft size={18} strokeWidth={1.75} color="#1A1A1A" aria-hidden="true" />
    </Link>
  )
}
