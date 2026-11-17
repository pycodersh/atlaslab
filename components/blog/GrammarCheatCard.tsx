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
import { ExamplePlay } from './ExamplePlay'

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

/**
 * 고친 문장 줄(warn) — 설명은 #111111, 한국어 정답 문장만 레드 굵게.
 * 정답은 'Say ' · 'Ask ' 뒤, 또는 마지막 ':' 뒤에 오는 한글이다(그 앞의 어미 이름 -(으)니까 등은 설명이라 칠하지 않는다).
 * 낱자 하나(ㄱ · ㅂ)는 정답 문장이 아니라 칠하지 않는다.
 */
function warnLine(text: string): ReactNode {
  const say = text.search(/\b(Say|say|Ask|ask)\b/)
  const colon = text.lastIndexOf(':')
  const from = say >= 0 ? say : colon >= 0 ? colon : text.length
  return text.split(HANGUL_RUN).map((part, i) => {
    if (!(i % 2)) return part
    const at = text.split(HANGUL_RUN).slice(0, i).join('').length
    const answer = at > from && !/^[ㄱ-ㆎ]$/.test(part)
    return answer
      ? <b key={i} className="gcc__fix" lang="ko" translate="no">{part}</b>
      : <span key={i} lang="ko" translate="no">{part}</span>
  })
}

export function RuleAvoid({ ko, rom, note, warn }: { ko: string; rom: string; note: string; warn: string }) {
  return (
    <div className="gcc__box is-avoid">
      <p className="gcc__tag">Avoid</p>
      <p className="gcc__word">
        <s lang="ko" translate="no">{ko}</s>
      </p>
      <p className="gcc__rom" translate="no">{rom}</p>
      <p className="gcc__text">{keepKo(note)}</p>
      <p className="gcc__warn">{warnLine(warn)}</p>
    </div>
  )
}

export function RuleInstead({ title = 'Say this instead', lead, children }: { title?: string; lead?: string; children?: ReactNode }) {
  return (
    <div className="gcc__box is-instead">
      <p className="gcc__tag">{title}</p>
      {lead && <p className="gcc__text">{keepKo(lead)}</p>}
      {/* 예문은 흰 박스 하나 안에서 구분선으로 나눈 목록 */}
      <div className="gcc__examples">{children}</div>
    </div>
  )
}

/** 예문 한 줄 — 한국어(굵게) → 로마자 → 영어 뜻, 오른쪽에 재생 버튼(기존 음성 파일이 있을 때만) */
export function RuleExample({ ko, rom, en }: { ko: string; rom: string; en: string }) {
  return (
    <div className="gcc__example">
      <p className="gcc__exText">
        <span className="gcc__exKo" lang="ko" translate="no">{ko}</span>
        <span className="gcc__rom" translate="no">{rom}</span>
        <span className="gcc__en">{keepKo(en)}</span>
      </p>
      <ExamplePlay ko={ko} />
    </div>
  )
}
