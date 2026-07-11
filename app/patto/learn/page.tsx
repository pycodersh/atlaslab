import { redirect } from 'next/navigation'

// /learn → /learn/1 으로 리다이렉트
// 향후 localStorage에서 currentStoryOrder를 읽어 해당 스토리로 이동 가능
export default function LearnPage() {
  redirect('/patto/learn/1')
}
