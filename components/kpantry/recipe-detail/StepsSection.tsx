import { placeStepImages, type StepRow } from '@/lib/kpantry/stepImages'

interface StepsSectionProps {
  /** 과정 사진을 어느 스텝에 붙일지 레시피별 매핑을 찾는 키 */
  slug: string
  steps: StepRow[]
}

/**
 * 조리 순서 — 각 스텝 설명 바로 아래에 그 스텝 사진을 붙인다(위에 모아 두던 3장 갤러리는 없앴다).
 * 사진이 없는 스텝은 글만. 한 스텝에 두 장이면 같은 크기로 위아래로.
 */
export default function StepsSection({ slug, steps }: StepsSectionProps) {
  const placed = placeStepImages(slug, steps)

  return (
    <section style={{ padding: '0 16px 20px' }}>
      <h2 style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 18,
        fontWeight: 700,
        color: '#1A1A1A',
        margin: '0 0 16px',
      }}>
        Steps
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {placed.map((step, index) => (
          <div key={step.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'var(--kp-bg)',
              border: '1.5px solid var(--kp-rule)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: '#6B6B6B',
              flexShrink: 0,
              marginTop: 2,
            }}>
              {step.step_order}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: '#1A1A1A',
                margin: '0 0 4px',
              }}>
                {step.title}
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                color: '#6B6B6B',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {step.description}
              </p>

              {/* 사진은 설명문 블록과 같은 폭, 16:10 — 두 장이면 같은 규격으로 위아래로 */}
              {step.images.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={step.images.length > 1 ? `Step ${step.step_order}: ${step.title} (${i + 1})` : `Step ${step.step_order}: ${step.title}`}
                  loading="lazy"
                  style={{
                    display: 'block',
                    width: '100%',
                    aspectRatio: '16 / 10',
                    objectFit: 'cover',
                    marginTop: 12,
                    borderRadius: 12,
                    border: '1px solid rgba(231, 229, 228, 0.6)',
                    backgroundColor: 'var(--kp-surface-muted)',
                  }}
                />
              ))}

              {index < placed.length - 1 && (
                <div style={{
                  marginTop: 16,
                  height: 1,
                  backgroundColor: 'var(--kp-surface-muted)',
                }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
