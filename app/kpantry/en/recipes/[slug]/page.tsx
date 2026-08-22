import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createAdminClient } from '@/lib/supabase/admin'
import RecipeDetailClient from '@/components/kpantry/recipe-detail/RecipeDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

// 앱 내부 자동 생성 상세 페이지 — 클라이언트 렌더링이라 크롤러에게는 거의 빈 페이지다.
// 색인에서 제외하되 내부 링크는 계속 따라가게 둔다. (사이트맵에는 원래 없음)
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

/**
 * 존재하지 않는 슬러그에 실제 HTTP 404 를 반환한다.
 * 이전에는 클라이언트 컴포넌트뿐이라 어떤 슬러그든 200 을 돌려주는 soft 404 였다.
 */
export default async function RecipeDetailPage({ params }: PageProps) {
  const { slug } = await params

  const admin = createAdminClient()
  const { data: recipe } = await admin
    .from('pantry_recipes')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle()

  if (!recipe) notFound()

  return <RecipeDetailClient slug={slug} />
}
