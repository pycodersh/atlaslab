/**
 * 블로그 본문(MDX)용 유튜브 임베드.
 *
 * 사용법 — 본문에서 한 줄로:
 *   <YouTube id="sWDjR0tnl3I" title="Asking for more banchan" />          // 쇼츠(9:16, 기본)
 *   <YouTube id="abc123" orientation="landscape" title="..." />            // 일반 영상(16:9)
 *
 * 주의: MDX 는 요청 시점에 컴파일되므로 태그를 반드시 자기 닫힘(`/>`)으로 쓸 것.
 * 닫히지 않으면 그 글 전체가 렌더 실패한다.
 *
 * 스타일을 인라인으로 두는 이유: 이 컴포넌트가 서로 다른 두 라우트
 * ([app]/[slug], patto/[slug])에서 쓰이는데, 각 라우트의 <style> 블록에
 * 규칙을 중복 정의하면 한쪽만 고쳐지는 사고가 나기 때문.
 */

type Props = {
  /** 유튜브 영상 ID (URL 전체가 아니라 ID만) */
  id: string
  /** 접근성용 제목. 생략하면 일반 라벨이 들어간다 */
  title?: string
  /** 쇼츠는 portrait(기본), 가로 영상은 landscape */
  orientation?: 'portrait' | 'landscape'
}

export function YouTube({ id, title, orientation = 'portrait' }: Props) {
  const portrait = orientation !== 'landscape'

  return (
    <div
      style={{
        // 세로 쇼츠는 360px 를 넘지 않게, 가로 영상은 본문 폭(720px)까지
        maxWidth: portrait ? 360 : 720,
        width: '100%',
        margin: '28px auto',
        aspectRatio: portrait ? '9 / 16' : '16 / 9',
        background: '#000',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title ?? 'YouTube video player'}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          border: 0,
        }}
      />
    </div>
  )
}
