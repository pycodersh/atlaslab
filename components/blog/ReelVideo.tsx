/**
 * 블로그 본문(MDX)용 세로 릴스 플레이어 — 인스타 iframe 대신 우리 저장소의 MP4 를 직접 튼다.
 *
 * 사용법 — 본문에서 한 줄로:
 *   <ReelVideo name="water" instagram="DfHCc1AqJc1" title="Ah! So sorry... Water, please!" />
 *
 * 파일은 Supabase Storage blog-covers/reels/ 에 둔다(scripts/upload-blog-cover.ts 로 올린다):
 *   reels/<name>.mp4          720×1280 H.264 + AAC, faststart, 1MB 안팎
 *   reels/<name>-poster.webp  720×1280 웹툰 장면 — 재생 전에 바로 보이는 첫 화면
 *
 * 인스타 임베드를 쓰지 않는 이유: 인스타는 9:16 영상을 4:5 틀에 넣어 좌우에 검은 띠를 그리고(iframe 안이라 못 고친다),
 * 폰과 데스크톱에 다른 배치를 보내 잘라 내는 방법도 통하지 않았다. 로딩도 몇 초씩 걸렸다.
 * preload="none" 이라 재생을 누르기 전에는 포스터 한 장만 받는다.
 * 스타일을 인라인으로 두는 이유는 YouTube 와 같다(두 라우트에서 쓰인다).
 */

const REELS_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-covers/reels`

type Props = {
  /** 저장소 파일 이름(확장자 없이) — reels/<name>.mp4 · reels/<name>-poster.webp */
  name: string
  /** 같은 영상의 인스타 릴스 ID — 있으면 아래에 'Watch on Instagram' 링크를 단다 */
  instagram?: string
  /** 접근성용 제목 */
  title?: string
}

export function ReelVideo({ name, instagram, title }: Props) {
  return (
    <figure style={{ margin: '28px auto', width: '100%', maxWidth: 320 }}>
      <video
        src={`${REELS_BASE}/${name}.mp4`}
        poster={`${REELS_BASE}/${name}-poster.webp`}
        controls
        playsInline
        preload="none"
        aria-label={title ?? 'Video'}
        style={{
          display: 'block',
          width: '100%',
          aspectRatio: '9 / 16',
          objectFit: 'cover',
          borderRadius: 12,
          background: '#F5F5F4',
        }}
      />
      {instagram && (
        <figcaption style={{ marginTop: 8, textAlign: 'center', fontSize: 12.5, lineHeight: 1.4 }}>
          <a
            href={`https://www.instagram.com/reel/${instagram}/`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#737373', textDecoration: 'none' }}
          >
            Watch on Instagram ↗
          </a>
        </figcaption>
      )}
    </figure>
  )
}
