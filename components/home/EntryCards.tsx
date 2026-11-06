import { BlogThumb } from '@/components/blog/BlogThumb'
import type { BlogThumbnail } from '@/lib/blog/thumbnail'

/**
 * 홈 히어로 바로 아래 — 사이트의 세 축(한국어 · 여행 · 음식)으로 곧장 들어가는 카드 세 장.
 * 예전 5단계 로드맵(링크 뭉치 · 모바일 단계 탭)을 걷어낸 자리다.
 *
 * 카드 사진은 각 축의 대표 글 썸네일을 빌려 온다(app/page.tsx 가 slug 로 풀어 넘긴다) — 그 글의 썸네일을 바꾸면 여기도 따라 바뀐다.
 * 넓은 화면 3열 카드, 폰은 [ 88px 사진 | 제목 + 한 줄 설명 ] 가로 줄로 쌓아 첫 화면이 길어지지 않게 한다.
 */
export type EntryCard = {
  key: string
  kicker: string
  title: string
  desc: string
  href: string
  thumb: BlogThumbnail | null
  thumbAlt: string
}

export function EntryCards({ cards }: { cards: EntryCard[] }) {
  if (!cards.length) return null
  return (
    <section className="ec-wrap wrap" aria-label="Start here">
      <style>{`
        .ec-wrap { padding-top: 40px; padding-bottom: 8px; }
        .ec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .ec-card {
          display: flex; flex-direction: column; text-decoration: none; color: inherit;
          background: #fff; border: 1px solid #E7E5E4; border-radius: 12px; overflow: hidden;
          transition: border-color .15s, box-shadow .15s;
        }
        .ec-card:hover { border-color: #D6D3D1; box-shadow: 0 2px 10px rgba(0,0,0,.05); }
        .ec-card .blog-thumb { border-radius: 0; }
        .ec-body { padding: 16px 18px 18px; display: flex; flex-direction: column; flex: 1; }
        .ec-kicker { font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #C8102E; margin-bottom: 6px; }
        .ec-title { font-family: "Playfair Display", Georgia, serif; font-size: 20px; font-weight: 700; line-height: 1.25; color: #111; margin-bottom: 6px; }
        .ec-desc { font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 13.5px; line-height: 1.55; color: #6B6B6B; flex: 1; }
        .ec-go { font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 13px; font-weight: 700; color: #111; margin-top: 12px; }
        .ec-card:hover .ec-go { color: #C8102E; }
        @media (max-width: 767px) {
          .ec-wrap { padding-top: 24px; padding-bottom: 0; }
          .ec-grid { grid-template-columns: 1fr; gap: 10px; }
          .ec-card { flex-direction: row; align-items: center; }
          .ec-card .blog-thumb { flex: 0 0 88px; width: 88px; height: 88px; aspect-ratio: auto; }
          .ec-body { padding: 10px 14px; min-width: 0; }
          .ec-kicker { font-size: 9.5px; margin-bottom: 3px; }
          .ec-title { font-size: 17px; margin-bottom: 2px; }
          .ec-desc { font-size: 12.5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .ec-go { display: none; }
        }
      `}</style>
      <div className="ec-grid">
        {cards.map(c => (
          <a key={c.key} href={c.href} className="ec-card">
            <BlogThumb thumb={c.thumb} alt={c.thumbAlt} />
            <div className="ec-body">
              <span className="ec-kicker">{c.kicker}</span>
              <span className="ec-title">{c.title}</span>
              <span className="ec-desc">{c.desc}</span>
              <span className="ec-go">Explore →</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
