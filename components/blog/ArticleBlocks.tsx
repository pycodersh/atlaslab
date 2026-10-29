import type { ReactNode } from 'react'
import { SAMPLE_PDF_URL, SAMPLE_PATTERNS, TRY_APP_PATH } from '@/lib/kpatto/purchase'

/**
 * Food · Life 글의 시각 블록 — docs/CONTENT_GUIDELINES.md 의 '1화면 1비주얼' 원칙용 MDX 컴포넌트.
 *
 *   <KeyTakeaways>         글 맨 위 요약 카드(서론 2문장 바로 아래). 안에 마크다운 불릿 3~4줄.
 *   <Dialogue> + <Line />  상황별 대화 — 말풍선(한국어 · 로마자 · 영어). me 를 주면 오른쪽(독자 쪽) 말풍선.
 *   <DoDont> + <Do> <Dont> 흔한 실수 박스 — 넓은 화면 2열, 폰 1열.
 *   <Callout type>         팁(tip) · 주의(warn) · 참고(info) 상자.
 *   <KpattoCta />          본문 중간 · 하단 CTA — 웹툰 Ep.1(웹앱) + 무료 10패턴 PDF.
 *
 * 스타일은 lib/blog/proseCss.ts(.blog-prose 아래)에 있다 — 글 상세 라우트 두 곳이 같은 CSS 를 쓴다.
 * 한국어 · 로마자는 자동 번역(브라우저 언어가 한국어일 때)에서 빼야 뜻이 남는다(translate="no").
 */

export function KeyTakeaways({ title = 'Key Takeaways', children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="quick-card key-takeaways">
      <p className="quick-card__title">{title}</p>
      <div className="key-takeaways__body">{children}</div>
    </div>
  )
}

export function Dialogue({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <figure className="dlg">
      {title && <figcaption className="dlg__title">{title}</figcaption>}
      <div className="dlg__lines">{children}</div>
    </figure>
  )
}

export function Line({ who, ko, rom, en, me = false }: { who: string; ko: string; rom: string; en: string; me?: boolean }) {
  return (
    <div className={me ? 'dlg__line is-me' : 'dlg__line'}>
      <span className="dlg__who">{who}</span>
      <div className="dlg__bubble">
        <p className="dlg__ko" lang="ko" translate="no">{ko}</p>
        <p className="dlg__rom" translate="no">{rom}</p>
        <p className="dlg__en">{en}</p>
      </div>
    </div>
  )
}

export function DoDont({ children }: { children?: ReactNode }) {
  return <div className="dodont">{children}</div>
}

export function Do({ title = 'Do', children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="dodont__col is-do">
      <p className="dodont__head">{title}</p>
      {children}
    </div>
  )
}

export function Dont({ title = "Don't", children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="dodont__col is-dont">
      <p className="dodont__head">{title}</p>
      {children}
    </div>
  )
}

export function Callout({ type = 'tip', title, children }: { type?: 'tip' | 'warn' | 'info'; title?: string; children?: ReactNode }) {
  return (
    <aside className={`callout is-${type}`}>
      {title && <p className="callout__title">{title}</p>}
      {children}
    </aside>
  )
}

const CTA_COPY = {
  mid: { title: 'Practice this situation in a webtoon', desc: 'Episode 1 of K-Patto is free in your browser, with native audio for every line.' },
  end: { title: 'Say it with confidence before you go', desc: `Read the first episode free, then take ${SAMPLE_PATTERNS} everyday patterns with you as a printable PDF.` },
} as const

export function KpattoCta({ variant = 'mid' }: { variant?: 'mid' | 'end' }) {
  const copy = CTA_COPY[variant]
  return (
    <aside className="kp-cta">
      <p className="kp-cta__eyebrow" translate="no">K-Patto</p>
      <p className="kp-cta__title">{copy.title}</p>
      <p className="kp-cta__desc">{copy.desc}</p>
      <div className="quick-card__btns">
        <a href={TRY_APP_PATH} className="cta-btn">Read Webtoon Ep.1 Free →</a>
        <a href={SAMPLE_PDF_URL} className="cta-btn cta-btn-outline" download>Free {SAMPLE_PATTERNS}-Pattern PDF ↓</a>
      </div>
    </aside>
  )
}
