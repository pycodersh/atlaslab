/**
 * 홈 카테고리 섹션의 공통 머리 — 얇은 검은 선 + 좌측 상단 라벨 + (선택) 우측 링크·아래 한 줄 설명.
 * 스타일은 app/globals.css 의 .section-header* 에 있다. 새 섹션도 이 컴포넌트만 쓰면 같은 모양이 된다.
 */
type Props = {
  label: string
  /** 우측 "View all" 같은 링크 */
  more?: { href: string; text: string }
  /** 선 아래 한 줄 설명 */
  desc?: string
  /** 라벨 요소의 id — 섹션의 aria-labelledby 용 */
  id?: string
}

export function SectionHeader({ label, more, desc, id }: Props) {
  return (
    <>
      <div className={`section-header${desc ? ' section-header--with-desc' : ''}`}>
        <h2 id={id} className="section-header__label">{label}</h2>
        {more && <a href={more.href} className="section-header__more">{more.text}</a>}
      </div>
      {desc && <p className="section-header__desc">{desc}</p>}
    </>
  )
}
