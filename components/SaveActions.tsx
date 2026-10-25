'use client'

import { useState } from 'react'
import { toggleBookmark, toggleLike, useSaves, type SaveItem } from '@/lib/saves'

/**
 * 북마크 · 좋아요 토글 두 개 — 콘텐츠 페이지 상단에 둔다.
 * 빈 아이콘 ↔ 채운 아이콘으로 바뀌고, 누를 때마다 살짝 커졌다 돌아오는 팝 애니메이션이 한 번 돈다.
 * tone="dark" 는 블랙 히어로 위, "light" 는 흰 바탕 위.
 */
export function SaveActions({ item, tone = 'light' }: { item: SaveItem; tone?: 'light' | 'dark' }) {
  const { bookmarks, likes } = useSaves()
  const saved = !!bookmarks[item.id]
  const liked = !!likes[item.id]
  // 같은 버튼을 연달아 눌러도 애니메이션이 다시 돌도록 매번 키를 바꾼다
  const [pop, setPop] = useState<{ which: 'bm' | 'like'; n: number } | null>(null)

  const onBookmark = () => { toggleBookmark(item); setPop(p => ({ which: 'bm', n: (p?.n ?? 0) + 1 })) }
  const onLike = () => { toggleLike(item.id); setPop(p => ({ which: 'like', n: (p?.n ?? 0) + 1 })) }

  return (
    <div className={`sa sa--${tone}`}>
      <style>{`
        .sa { display: inline-flex; align-items: center; gap: 4px; }
        .sa-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; padding: 0; border: none; border-radius: 50%;
          background: none; cursor: pointer; -webkit-tap-highlight-color: transparent;
          transition: background .15s, color .15s;
        }
        .sa--dark .sa-btn { color: rgba(255,255,255,.6); }
        .sa--dark .sa-btn:hover { color: #fff; background: rgba(255,255,255,.08); }
        .sa--light .sa-btn { color: #8A8580; }
        .sa--light .sa-btn:hover { color: #111; background: rgba(0,0,0,.05); }
        .sa-btn[aria-pressed="true"].sa-bm { color: var(--brand-red, #C8102E); }
        .sa--dark .sa-btn[aria-pressed="true"].sa-bm { color: #fff; }
        .sa-btn[aria-pressed="true"].sa-like { color: #E5484D; }
        .sa-btn:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
        .sa-ico { display: block; }
        .sa-pop { animation: saPop .32s cubic-bezier(.3,1.6,.5,1); }
        @keyframes saPop { 0% { transform: scale(1); } 40% { transform: scale(1.32); } 100% { transform: scale(1); } }
        @media (prefers-reduced-motion: reduce) { .sa-pop { animation: none; } }
      `}</style>

      <button
        type="button"
        className="sa-btn sa-bm"
        aria-pressed={saved}
        aria-label={saved ? 'Remove bookmark' : 'Bookmark'}
        title={saved ? 'Saved to My Bookmarks' : 'Bookmark'}
        onClick={onBookmark}
      >
        <svg
          key={pop?.which === 'bm' ? pop.n : 0}
          className={`sa-ico${pop?.which === 'bm' ? ' sa-pop' : ''}`}
          width="20" height="20" viewBox="0 0 24 24"
          fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 3.5h12a.5.5 0 0 1 .5.5v16.2a.3.3 0 0 1-.48.24L12 16l-6.02 4.44a.3.3 0 0 1-.48-.24V4a.5.5 0 0 1 .5-.5z" />
        </svg>
      </button>

      <button
        type="button"
        className="sa-btn sa-like"
        aria-pressed={liked}
        aria-label={liked ? 'Unlike' : 'Like'}
        title={liked ? 'Liked' : 'Like'}
        onClick={onLike}
      >
        <svg
          key={pop?.which === 'like' ? pop.n : 0}
          className={`sa-ico${pop?.which === 'like' ? ' sa-pop' : ''}`}
          width="20" height="20" viewBox="0 0 24 24"
          fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
        </svg>
      </button>
    </div>
  )
}
