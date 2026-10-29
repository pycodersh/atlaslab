/**
 * '너 vs 당신' 요약 인포그래픽 카드 — Basics 글 korean-never-say-dangsin-neo 본문에서 <GrammarCheatCard /> 로 부른다.
 *
 *   위험 단어 2개(빨강) → 골든 룰(초록) → 대신 쓸 호칭(골드) → 캡션
 *
 * 문구가 이 글 전용이라 props 없이 둔다. 다른 글에도 쓰게 되면 그때 내용을 props 로 뺀다.
 * 스타일은 lib/blog/proseCss.ts 의 .gcc 규칙(.blog-prose 아래) — 다른 본문 블록과 같은 방식이다.
 * 한국어 · 로마자는 자동 번역에서 빼야 뜻이 남는다(translate="no").
 */

const DANGER = [
  {
    ko: '너',
    rom: 'Neo',
    body: 'Only for close same-age friends or younger kids.',
    warn: 'Said to anyone else, it’s extremely rude.',
  },
  {
    ko: '당신',
    rom: 'Dangsin',
    body: 'Not a polite “you.” Heard in K-drama street fights or between older married couples.',
    warn: 'Never say it to strangers or taxi drivers.',
  },
] as const

const SAFE = [
  { icon: '🏪', where: 'Shops & restaurants', ko: '사장님', rom: 'Sajangnim', note: 'The all-purpose title for owners and staff' },
  { icon: '🚕', where: 'Taxis & deliveries', ko: '기사님', rom: 'Gisanim', note: 'For drivers and delivery workers' },
  { icon: '🙋', where: 'Getting attention', ko: '저기요!', rom: 'Jeogiyo', note: 'The safest “excuse me”' },
  { icon: '👵', where: 'Asking an elder for directions', ko: '어르신 · 선생님', rom: 'Eoreusin · Seonsaengnim', note: 'Respectful for older people' },
] as const

export function GrammarCheatCard() {
  return (
    <aside className="gcc" aria-label="Cheat sheet: how to say you in Korean">
      <p className="gcc__badge">Critical rule</p>
      <p className="gcc__title">Why You Should Never Say &lsquo;YOU&rsquo; in Korea</p>

      <div className="gcc__danger">
        {DANGER.map(d => (
          <div key={d.ko} className="gcc__box is-danger">
            <p className="gcc__word">
              <span aria-hidden="true">❌</span> <span lang="ko" translate="no">{d.ko}</span>{' '}
              <span className="gcc__rom" translate="no">({d.rom})</span>
            </p>
            <p className="gcc__text">{d.body}</p>
            <p className="gcc__warn">{d.warn}</p>
          </div>
        ))}
      </div>

      <div className="gcc__box is-golden">
        <p className="gcc__word"><span aria-hidden="true">💡</span> Drop &lsquo;You&rsquo; Completely!</p>
        <p className="gcc__text">
          Korean runs on context. When it&rsquo;s obvious who you&rsquo;re talking to, leave the &ldquo;you&rdquo; out entirely.
        </p>
        <p className="gcc__example">
          <span lang="ko" translate="no">커피 마실래요?</span>
          <span className="gcc__en">“Want some coffee?” (no “you” needed)</span>
        </p>
      </div>

      <div className="gcc__box is-safe">
        <p className="gcc__head">Safe cheat-sheet: say this instead</p>
        <ul className="gcc__list">
          {SAFE.map(s => (
            <li key={s.ko}>
              <span className="gcc__icon" aria-hidden="true">{s.icon}</span>
              <span className="gcc__where">{s.where}</span>
              <span className="gcc__say">
                <b lang="ko" translate="no">{s.ko}</b> <span className="gcc__rom" translate="no">{s.rom}</span>
              </span>
              <span className="gcc__note">{s.note}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="gcc__foot" translate="no">K-PATTO Webtoon Series</p>
    </aside>
  )
}
