/**
 * 블로그 본문(MDX)용 인스타그램 릴스 · 게시물 임베드.
 *
 * 사용법 — 본문에서 한 줄로:
 *   <Instagram id="DfHCc1AqJc1" title="Water, please" />          // 릴스(기본)
 *   <Instagram id="Cxyz..." kind="p" title="..." />               // 일반 게시물
 *
 * 인스타그램 공식 코드(<blockquote> + embed.js)는 MDX 에서 <script> 를 돌릴 수 없어 쓰지 않는다.
 * 같은 화면을 주는 /embed/ 주소를 iframe 으로 바로 넣는다.
 * 높이는 고정이다 — 인스타 임베드는 위 계정 줄 · 아래 '더 보기' 줄이 붙어 비율로 맞출 수 없다.
 * 폭이 좁은 폰에서는 영상이 조금 작아지고 아래에 흰 여백이 약간 남는다(잘리는 것보다 낫다).
 * 스타일을 인라인으로 두는 이유는 YouTube 와 같다(두 라우트에서 쓰인다).
 */

type Props = {
  /** 릴스 · 게시물 주소의 코드(URL 전체가 아니라 /reel/ 뒤의 ID만) */
  id: string
  /** 접근성용 제목 */
  title?: string
  /** reel(기본) 또는 일반 게시물 p */
  kind?: 'reel' | 'p'
}

export function Instagram({ id, title, kind = 'reel' }: Props) {
  return (
    <div
      style={{
        maxWidth: 360,
        width: '100%',
        margin: '28px auto',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid #E7E5E4',
        background: '#fff',
      }}
    >
      <iframe
        src={`https://www.instagram.com/${kind}/${id}/embed/`}
        title={title ?? 'Instagram video'}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        scrolling="no"
        // 360px 폭에서 계정 줄 + 영상 + '더 보기' · 좋아요 · 댓글 줄까지 약 690px(2026-11-05 실측)
        style={{ display: 'block', width: '100%', height: 700, border: 0 }}
      />
    </div>
  )
}
