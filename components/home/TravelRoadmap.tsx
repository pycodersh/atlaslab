import { BlogThumb } from '@/components/blog/BlogThumb'
import { SectionHeader } from '@/components/SectionHeader'
import type { BlogThumbnail } from '@/lib/blog/thumbnail'

/**
 * 홈 '첫 여행 로드맵' — lib/home/roadmap 의 다섯 단계를 실제 글로 풀어 그린다(app/page.tsx 가 글을 찾아 넘긴다).
 * PC(1000px 이상): 다섯 단계가 가로 5열. 그 아래: 단계마다 한 줄(왼쪽 대표 글 카드 · 오른쪽 링크).
 * 단계 번호는 순서가 의미라 <ol> 로 둔다.
 */
export type ResolvedLink = { href: string; label: string }
export type ResolvedStep = {
  key: string
  step: string
  title: string
  blurb: string
  hub: { href: string; title: string; thumb: BlogThumbnail | null } | null
  more: ResolvedLink[]
  phrase: ResolvedLink | null
}

const SERIF = '"Playfair Display", Georgia, serif'
const BODY = '"DM Sans", system-ui, sans-serif'

const CSS = `
.rm-wrap { padding-top: 48px; padding-bottom: 56px; }
@media (max-width: 700px) { .rm-wrap { padding-top: 32px; padding-bottom: 40px; } }
.rm-list {
  list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(5, minmax(0, 1fr));
  border-top: 2px solid var(--ink, #111);
}
.rm-step {
  padding: 18px 16px 20px;
  border-right: 1px solid var(--rule, #E5E1DC);
  display: flex; flex-direction: column; min-width: 0;
}
.rm-step:first-child { padding-left: 0; }
.rm-step:last-child { border-right: none; padding-right: 0; }
.rm-num {
  font-family: ${BODY}; font-size: 10.5px; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--brand-red, #C8102E); margin-bottom: 6px;
}
.rm-title {
  font-family: ${SERIF}; font-size: 18px; font-weight: 700;
  line-height: 1.2; letter-spacing: -0.01em; color: var(--ink, #111);
  margin-bottom: 6px;
}
.rm-blurb {
  font-family: ${BODY}; font-size: 12.5px; line-height: 1.55;
  color: var(--ink-muted, #6B6B6B); margin-bottom: 14px;
}
.rm-hub { display: block; text-decoration: none; color: inherit; margin-bottom: 12px; }
.rm-hub .blog-thumb { margin-bottom: 8px; }
.rm-hub-title {
  font-family: ${SERIF}; font-size: 14px; font-weight: 700; line-height: 1.32;
  color: var(--ink, #111);
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.rm-hub:hover .rm-hub-title { color: var(--brand-red, #C8102E); }
.rm-side { display: flex; flex-direction: column; flex: 1; }
.rm-more { list-style: none; margin: 0 0 14px; padding: 0; }
.rm-more li + li { border-top: 1px solid var(--rule, #E5E1DC); }
.rm-more a {
  display: block; padding: 8px 0;
  font-family: ${BODY}; font-size: 13px; line-height: 1.35;
  color: var(--ink, #111); text-decoration: none;
}
.rm-more a::after { content: ' →'; color: var(--ink-muted, #6B6B6B); }
.rm-more a:hover { color: var(--brand-red, #C8102E); }
.rm-phrase {
  margin-top: auto;
  display: block; text-decoration: none;
  background: var(--paper-2, #F5F5F3);
  border-left: 3px solid var(--brand-red, #C8102E);
  padding: 9px 10px;
  font-family: ${BODY}; font-size: 12.5px; line-height: 1.4; color: var(--ink, #111);
}
.rm-phrase small {
  display: block; font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink-muted, #6B6B6B); margin-bottom: 2px;
}
.rm-phrase:hover { color: var(--brand-red, #C8102E); }

/* 1000px 미만 — 단계마다 한 줄: 왼쪽(번호 · 제목 · 대표 글), 오른쪽(링크 · 회화) */
@media (max-width: 999px) {
  .rm-list { grid-template-columns: 1fr; }
  .rm-step {
    padding: 20px 0; border-right: none;
    border-bottom: 1px solid var(--rule, #E5E1DC);
    display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0 28px;
  }
  .rm-step:last-child { border-bottom: none; }
  .rm-head { grid-column: 1 / -1; }
  .rm-hub { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 12px; align-items: start; margin-bottom: 0; }
  .rm-hub .blog-thumb { margin-bottom: 0; }
  .rm-side { display: flex; flex-direction: column; }
}
/* 600px 미만 — 세로로 쌓는다. 대표 글은 홈 카드와 같은 가로형(96px 썸네일) */
@media (max-width: 599px) {
  .rm-step { display: flex; flex-direction: column; padding: 18px 0; }
  .rm-hub { grid-template-columns: 96px minmax(0, 1fr); margin-bottom: 10px; }
  .rm-hub-title { font-size: 14.5px; }
  .rm-more { margin-bottom: 10px; }
}
`

export function TravelRoadmap({ steps }: { steps: ResolvedStep[] }) {
  if (!steps.length) return null
  return (
    <section id="roadmap" className="wrap rm-wrap" aria-labelledby="sec-roadmap">
      <style>{CSS}</style>
      <SectionHeader
        id="sec-roadmap"
        label="Your first days in Korea"
        desc="Follow it in order — every step links the guide to read and the Korean to say."
        more={{ href: '/blog', text: 'All guides →' }}
      />
      <ol className="rm-list">
        {steps.map((s, i) => (
          <li key={s.key} className="rm-step">
            <div className="rm-head">
              <p className="rm-num">{String(i + 1).padStart(2, '0')} · {s.step}</p>
              <h3 className="rm-title">{s.title}</h3>
              <p className="rm-blurb">{s.blurb}</p>
            </div>
            {s.hub && (
              <a href={s.hub.href} className="rm-hub">
                <BlogThumb thumb={s.hub.thumb} alt={s.hub.title} />
                <span className="rm-hub-title">{s.hub.title}</span>
              </a>
            )}
            <div className="rm-side">
              {s.more.length > 0 && (
                <ul className="rm-more">
                  {s.more.map(m => (
                    <li key={m.href}><a href={m.href}>{m.label}</a></li>
                  ))}
                </ul>
              )}
              {s.phrase && (
                <a href={s.phrase.href} className="rm-phrase">
                  <small>Say it in Korean</small>
                  {s.phrase.label} →
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
