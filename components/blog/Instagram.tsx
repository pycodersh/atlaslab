/**
 * 블로그 본문(MDX)용 인스타그램 릴스 · 게시물 임베드.
 *
 * 사용법 — 본문에서 한 줄로:
 *   <Instagram id="DfHCc1AqJc1" title="Water, please" />          // 릴스(기본)
 *   <Instagram id="Cxyz..." kind="p" title="..." />               // 일반 게시물
 *
 * 인스타그램 공식 코드(<blockquote> + embed.js)는 MDX 에서 <script> 를 돌릴 수 없어 쓰지 않는다.
 * 같은 화면을 주는 /embed/ 주소를 iframe 으로 바로 넣는다.
 *
 * 릴스는 영상만 잘라 보인다. 인스타 임베드는 9:16 영상을 4:5 상자에 넣어 좌우에 검은 띠가 생기고
 * (iframe 안이라 우리 CSS 로 색을 바꿀 수 없다), 위에 계정 줄 · 아래에 좋아요 · 댓글 줄이 붙는다.
 * 그래서 iframe 을 넓게 깔고 영상 부분만 보이는 320 × 566 창으로 잘라낸다(2026-11-05 실측):
 *   iframe 폭 470 → 영상이 그 폭의 약 70% · 높이 566 이상, 계정 줄은 위 64px.
 * 잘려 나간 출처 표시는 아래 'Watch on Instagram' 링크가 대신한다.
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

/** 보이는 영상 창 */
const VIEW_W = 320
const VIEW_H = 566
/** 영상이 창을 꽉 채우도록 깔아 두는 iframe 폭과, 잘라 낼 위쪽 계정 줄 높이 */
const FRAME_W = 470
const HEADER_H = 64

export function Instagram({ id, title, kind = 'reel' }: Props) {
  const href = `https://www.instagram.com/${kind}/${id}/`

  if (kind === 'p') {
    // 일반 게시물은 정사각 · 가로 사진도 있어 자르지 않고 그대로 보인다
    return (
      <div style={{ maxWidth: 360, width: '100%', margin: '28px auto', borderRadius: 8, overflow: 'hidden', border: '1px solid #E7E5E4', background: '#fff' }}>
        <iframe
          src={`${href}embed/`}
          title={title ?? 'Instagram post'}
          loading="lazy"
          scrolling="no"
          style={{ display: 'block', width: '100%', height: 640, border: 0 }}
        />
      </div>
    )
  }

  return (
    <figure style={{ margin: '28px auto', width: VIEW_W, maxWidth: '100%' }}>
      <div
        style={{
          position: 'relative',
          width: VIEW_W,
          maxWidth: '100%',
          height: VIEW_H,
          margin: '0 auto',
          overflow: 'hidden',
          borderRadius: 12,
          background: '#fff',
        }}
      >
        <iframe
          src={`${href}embed/`}
          title={title ?? 'Instagram reel'}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          scrolling="no"
          style={{
            position: 'absolute',
            top: -HEADER_H,
            left: '50%',
            width: FRAME_W,
            height: VIEW_H + HEADER_H + 160,
            marginLeft: -FRAME_W / 2,
            border: 0,
          }}
        />
      </div>
      <figcaption style={{ marginTop: 8, textAlign: 'center', fontSize: 12.5, lineHeight: 1.4 }}>
        <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#737373', textDecoration: 'none' }}>
          Watch on Instagram ↗
        </a>
      </figcaption>
    </figure>
  )
}
