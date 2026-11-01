import { LESSONS } from '@/data/kpatto/precourse/lessons'

// page.tsx 가 클라이언트 컴포넌트라 generateStaticParams 를 여기 둔다 — 레슨 전부를 빌드 때 정적으로 굽는다
export const dynamicParams = false

export function generateStaticParams() {
  return LESSONS.map(l => ({ lesson: String(l.id) }))
}

export default function LessonLayout({ children }: { children: React.ReactNode }) {
  return children
}
