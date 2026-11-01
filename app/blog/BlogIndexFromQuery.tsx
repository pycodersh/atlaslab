'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BlogClientPage } from './BlogClientPage'
import { blogIndexView, type BlogCard } from '@/lib/blog/indexView'
import { legacyTabTarget } from '@/lib/blog/sections'

/** /blog 는 정적 페이지라 쿼리(tab · sub · lang · page)는 브라우저에서 읽어 적용한다 */
export function BlogIndexFromQuery({ cards }: { cards: BlogCard[] }) {
  const sp = useSearchParams()
  const router = useRouter()
  const q = { page: sp.get('page'), tab: sp.get('tab'), lang: sp.get('lang'), sub: sp.get('sub') }

  // 예전 탭 주소(stay-in-korea, 통합 Korean 보기)는 현재 구조로 옮긴다
  const legacy = q.tab ? legacyTabTarget(q.tab, q.sub ?? undefined) : null
  const legacyTab = legacy?.tab
  const legacySub = legacy?.sub
  useEffect(() => {
    if (!legacyTab) return
    const next = new URLSearchParams({ tab: legacyTab })
    if (legacySub) next.set('sub', legacySub)
    if (q.lang === 'ko') next.set('lang', 'ko')
    if (q.page && q.page !== '1') next.set('page', q.page)
    router.replace(`/blog?${next.toString()}`)
  }, [legacyTab, legacySub, q.lang, q.page, router])

  const view = blogIndexView(cards, q)

  useEffect(() => {
    document.title = `${view.pageTitle} — Atlas Lab`
  }, [view.pageTitle])

  return <BlogClientPage {...view} />
}
