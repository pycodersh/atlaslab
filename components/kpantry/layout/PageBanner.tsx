/**
 * 서브 화면(재료·레시피·기본 양념) 맨 위 사진 띠 — 높이 140px, 아래쪽은 본문 배경(#FDFBF7)으로 녹아든다.
 * 뒤로 버튼은 사진 왼쪽 위에 얹고, 제목은 각 화면이 띠 바로 아래(페이드 구간에 살짝 겹치게) 그린다.
 * 사진은 public/kpantry/banner-*.jpg — 3단 배너(1672×941)를 흰 구분선 기준으로 자른 1672×~305 컷.
 */
export const BANNER_H = 140

export default function PageBanner({ src, back }: { src: string; back: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', height: BANNER_H, overflow: 'hidden', backgroundColor: 'var(--kp-surface-muted)' }}>
      <img
        src={src}
        alt=""
        width={1672}
        height={305}
        fetchPriority="high"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, #FDFBF7 0%, rgba(253, 251, 247, 0.6) 35%, rgba(253, 251, 247, 0) 70%)',
      }} />
      <div style={{ position: 'absolute', top: 'calc(16px + env(safe-area-inset-top))', left: 20 }}>
        {back}
      </div>
    </div>
  )
}
