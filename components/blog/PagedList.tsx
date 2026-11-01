'use client'

import { Fragment, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

/**
 * 정적 목록 페이지의 페이지 넘김 — 서버는 글 전체를 한 번 그려 items 로 넘기고,
 * ?page= 는 브라우저에서 읽어 잘라 보여 준다(서버가 쿼리를 읽으면 페이지가 동적이 된다).
 *
 * variant 'pill'    — /blog/{locale}/{app}, /blog/{locale}/patto (현재 페이지 ±2, 한국어 문구)
 * variant 'compact' — /blog/{locale} (현재 페이지 ±1, 영어 문구)
 */
type Props = {
  items: ReactNode[]
  perPage: number
  basePath: string
  variant: 'pill' | 'compact'
  /** 글 목록을 감싸는 div 의 스타일(페이지 넘김은 이 div 밖에 놓인다) */
  listStyle?: CSSProperties
}

/** 쿼리를 읽기 전(정적 HTML · 크롤러)에 보여 줄 첫 페이지 — page.tsx 의 Suspense fallback */
export function PagedListView({ page, ...props }: Props & { page: number }) {
  const { items, perPage, basePath, variant, listStyle } = props
  const totalCount = items.length
  const totalPages = Math.ceil(totalCount / perPage)
  const currentPage = Math.min(Math.max(1, page), Math.max(1, totalPages))
  const from = (currentPage - 1) * perPage
  const href = (p: number) => (p > 1 ? `${basePath}?page=${p}` : basePath)
  const pill = variant === 'pill'
  const span = pill ? 2 : 1

  return (
    <>
      <div style={listStyle}>{items.slice(from, from + perPage)}</div>

      {totalPages > 1 && (
        <div style={pill
          ? { display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }
          : { display: 'flex', gap: 6, marginTop: 28, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          {currentPage > 1 && (
            <Link href={href(currentPage - 1)} style={pill ? pillNavStyle : compactStyle(false)}>
              {pill ? '← 이전' : '← Prev'}
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= span)
            .map((p, idx, arr) => (
              <Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span style={pill ? { color: 'rgba(255,255,255,0.3)', padding: '0.5rem' } : { color: 'rgba(255,255,255,0.3)', padding: '0 2px' }}>
                    {pill ? '...' : '…'}
                  </span>
                )}
                <Link href={href(p)} style={pill ? pillPageStyle(p === currentPage) : compactStyle(p === currentPage)}>{p}</Link>
              </Fragment>
            ))}
          {currentPage < totalPages && (
            <Link href={href(currentPage + 1)} style={pill ? pillNavStyle : compactStyle(false)}>
              {pill ? '다음 →' : 'Next →'}
            </Link>
          )}
        </div>
      )}
      {totalPages > 1 && (
        pill ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '1rem' }}>
            {currentPage} / {totalPages} 페이지 · 총 {totalCount}개 글
          </p>
        ) : (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 10 }}>
            Page {currentPage} of {totalPages} · {totalCount} posts
          </p>
        )
      )}
    </>
  )
}

export function PagedList(props: Props) {
  const page = parseInt(useSearchParams().get('page') || '1') || 1
  return <PagedListView {...props} page={page} />
}

const pillNavStyle: CSSProperties = {
  padding: '0.5rem 1rem', borderRadius: '8px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem',
}

function pillPageStyle(active: boolean): CSSProperties {
  return {
    padding: '0.5rem 0.875rem', borderRadius: '8px',
    background: active ? '#7c6fff' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? '#7c6fff' : 'rgba(255,255,255,0.1)'}`,
    color: active ? 'white' : 'rgba(255,255,255,0.6)',
    textDecoration: 'none', fontSize: '0.9rem',
    fontWeight: active ? 600 : 400,
  }
}

function compactStyle(active: boolean): CSSProperties {
  return {
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    padding: '5px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    background: active ? '#7c6fff' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? '#7c6fff' : 'rgba(255,255,255,0.1)'}`,
    color: active ? 'white' : 'rgba(255,255,255,0.55)',
    display: 'inline-block',
  }
}
