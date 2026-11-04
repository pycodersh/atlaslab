/**
 * 홈 카테고리 섹션의 공통 머리 — 얇은 검은 선 + 좌측 상단 라벨 + (선택) 우측 링크·아래 한 줄 설명.
 * 스타일은 app/globals.css 의 .section-header* 에 있다. 새 섹션도 이 컴포넌트만 쓰면 같은 모양이 된다.
 */
type Props = {
  /** 서브 타이틀(PHRASES, EXPLORE KOREA …). axis 만 있으면 비워 둔다 */
  label?: string
  /** 대분류(Our Apps · Learn Korean · Travel & Life) — 라벨 앞에 딥레드 굵은 글자로 붙는다(바탕 · 테두리 없음) */
  axis?: string
  /** 우측 "View all" 같은 링크 */
  more?: { href: string; text: string }
  /** 선 아래 한 줄 설명 */
  desc?: string
  /** 라벨 요소의 id — 섹션의 aria-labelledby 용 */
  id?: string
}

export function SectionHeader({ label, axis, more, desc, id }: Props) {
  return (
    <>
      <div className={`section-header${desc ? ' section-header--with-desc' : ''}`}>
        <h2 id={id} className="section-header__label">
          {/* 대분류 이름은 자동 번역에서 뺀다 — 브라우저 번역이 'Korean' 을 '한국인'으로 바꿔 뜻이 달라진다 */}
          {axis && <span className="section-header__axis notranslate" translate="no">{axis}</span>}
          {axis && label && ' '}
          {label}
        </h2>
        {more && <a href={more.href} className="section-header__more">{more.text}</a>}
      </div>
      {desc && <p className="section-header__desc">{desc}</p>}
    </>
  )
}
