/**
 * '너 vs 당신' 요약 인포그래픽 카드 — Basics 글 korean-never-say-dangsin-neo 본문에서 <GrammarCheatCard /> 로 부른다.
 *
 *   피할 단어 2개(옅은 레드 틴트, 2분할) → 대안: 주어 생략 · 호칭 대체(옅은 크림 틴트) → 캡션
 *
 * 본문과 한 문서처럼 읽히도록 밝은 에디토리얼 톤(아이보리 · 차콜 · 사이트 레드)만 쓰고, 이모지 대신 텍스트 뱃지를 쓴다.
 * 문구가 이 글 전용이라 props 없이 둔다. 다른 Basics 글은 아래 RuleCard 조립형으로 같은 카드를 만든다.
 * 스타일은 lib/blog/proseCss.ts 의 .gcc 규칙(.blog-prose 아래) — 다른 본문 블록과 같은 방식이다.
 * 한국어 · 로마자는 자동 번역에서 빼야 뜻이 남는다(translate="no").
 */
import type { ReactNode } from 'react'

const AVOID = [
  {
    ko: '너',
    rom: 'neo',
    body: 'Only for close friends your own age, or children.',
    warn: 'Said to anyone else, it sounds rude.',
  },
  {
    ko: '당신',
    rom: 'dangsin',
    body: 'Not a polite “you.” It’s heard in K-drama arguments and between older married couples.',
    warn: 'Never say it to strangers or taxi drivers.',
  },
] as const

const TITLES = [
  { where: 'Shops & restaurants', ko: '사장님', rom: 'sajangnim', note: 'All-purpose title for owners and staff' },
  { where: 'Taxis & deliveries', ko: '기사님', rom: 'gisanim', note: 'For drivers and delivery workers' },
  { where: 'Getting attention', ko: '저기요', rom: 'jeogiyo', note: 'The safest “excuse me”' },
  { where: 'Asking an elder', ko: '어르신 · 선생님', rom: 'eoreusin · seonsaengnim', note: 'Respectful for older people' },
] as const

export function GrammarCheatCard() {
  return (
    <aside className="gcc" aria-label="Cheat sheet: how to say you in Korean">
      <p className="gcc__badge">Critical rule</p>
      <p className="gcc__title">Why you should never say &ldquo;you&rdquo; in Korean</p>

      <div className="gcc__avoid">
        {AVOID.map(d => (
          <div key={d.ko} className="gcc__box is-avoid">
            <p className="gcc__tag">Avoid</p>
            <p className="gcc__word">
              <span lang="ko" translate="no">{d.ko}</span>{' '}
              <span className="gcc__rom" translate="no">{d.rom}</span>
            </p>
            <p className="gcc__text">{d.body}</p>
            <p className="gcc__warn">{d.warn}</p>
          </div>
        ))}
      </div>

      <div className="gcc__box is-instead">
        <p className="gcc__tag">Say this instead</p>

        <p className="gcc__step">1. Drop the subject</p>
        <p className="gcc__text">
          Korean runs on context. When it&rsquo;s clear who you&rsquo;re talking to, leave &ldquo;you&rdquo; out entirely.
        </p>
        <p className="gcc__example">
          <span lang="ko" translate="no">커피 마실래요?</span>
          <span className="gcc__en">Want some coffee? (no &ldquo;you&rdquo; needed)</span>
        </p>

        <p className="gcc__step">2. Use a title</p>
        <ul className="gcc__list">
          {TITLES.map(s => (
            <li key={s.ko}>
              <span className="gcc__where">{s.where}</span>
              <span className="gcc__say">
                <b lang="ko" translate="no">{s.ko}</b> <span className="gcc__rom" translate="no">{s.rom}</span>
              </span>
              <span className="gcc__note">{s.note}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="gcc__foot" translate="no">K-Patto Webtoon Series</p>
    </aside>
  )
}

/**
 * 같은 카드의 조립형 — 다른 Basics 글은 MDX 에서 이렇게 쓴다.
 *
 *   <RuleCard badge="Critical rule" title="...">
 *   <RuleAvoid ko="..." rom="..." note="..." warn="..." />      ← 2개(넓은 화면 2분할)
 *   <RuleInstead lead="...">
 *   <RuleExample ko="..." rom="..." en="..." />                 ← 3~4개
 *   </RuleInstead>
 *   </RuleCard>
 *
 * next-mdx-remote v6 는 MDX 속성의 JS 식(배열 · 객체)을 막으므로 문자열 속성만 쓴다.
 * 레이아웃은 .gcc.is-flat 그리드 — 피할 말 상자만 한 칸씩, 나머지는 한 줄 전체.
 */
/** 영어 문장 속 한글(예: "Say 공부 안 해요.")만 자동 번역에서 뺀다 — 안 빼면 번역기가 예문까지 바꿔 뜻이 뒤집힌다 */
const HANGUL_RUN = /([ㄱ-ㆎ가-힣]+(?:[\s/~()-]+[ㄱ-ㆎ가-힣]+)*)/
function keepKo(text: string): ReactNode {
  return text.split(HANGUL_RUN).map((part, i) =>
    i % 2 ? <span key={i} lang="ko" translate="no">{part}</span> : part,
  )
}

export function RuleCard({ badge = 'Critical rule', title, foot = 'K-Patto Webtoon Series', children }: { badge?: string; title: string; foot?: string; children?: ReactNode }) {
  return (
    <aside className="gcc is-flat" aria-label={`Cheat sheet: ${title}`}>
      <p className="gcc__badge">{badge}</p>
      <p className="gcc__title">{keepKo(title)}</p>
      {children}
      <p className="gcc__foot" translate="no">{foot}</p>
    </aside>
  )
}

export function RuleAvoid({ ko, rom, note, warn }: { ko: string; rom: string; note: string; warn: string }) {
  return (
    <div className="gcc__box is-avoid">
      <p className="gcc__tag">Avoid</p>
      <p className="gcc__word">
        <span lang="ko" translate="no">{ko}</span>{' '}
        <span className="gcc__rom" translate="no">{rom}</span>
      </p>
      <p className="gcc__text">{keepKo(note)}</p>
      <p className="gcc__warn">{keepKo(warn)}</p>
    </div>
  )
}

export function RuleInstead({ title = 'Say this instead', lead, children }: { title?: string; lead?: string; children?: ReactNode }) {
  return (
    <div className="gcc__box is-instead">
      <p className="gcc__tag">{title}</p>
      {lead && <p className="gcc__text">{keepKo(lead)}</p>}
      {children}
    </div>
  )
}

export function RuleExample({ ko, rom, en }: { ko: string; rom: string; en: string }) {
  return (
    <p className="gcc__example">
      <span lang="ko" translate="no">{ko}</span>{' '}
      <span className="gcc__rom" translate="no">{rom}</span>
      <span className="gcc__en">{keepKo(en)}</span>
    </p>
  )
}
