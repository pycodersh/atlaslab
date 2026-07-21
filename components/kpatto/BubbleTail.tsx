import type { BubbleTailData } from '@/data/kpatto/webtoon-types'

interface OvalParams {
  cx: number; cy: number; rx: number; ry: number
}

interface BubbleTailSvgProps {
  tail: BubbleTailData
  viewBoxW?: number
  viewBoxH?: number
  oval?: OvalParams
  style?: React.CSSProperties
}

/**
 * Renders a smooth triangular tail for a speech bubble.
 * The tail connects at `anchor` on the oval perimeter and points to `(tipX, tipY)`.
 * Base center is pulled 6px inside the oval so the body stroke covers the joint seam.
 */
export function BubbleTailSvg({
  tail,
  viewBoxW = 320,
  viewBoxH = 200,
  oval = { cx: 0.5, cy: 0.475, rx: 0.4625, ry: 0.40 },
  style,
}: BubbleTailSvgProps) {
  const { anchor, tipX, tipY, baseWidth } = tail
  const { cx, cy, rx, ry } = oval

  const θ = anchor * 2 * Math.PI
  const cosθ = Math.cos(θ)
  const sinθ = Math.sin(θ)

  // Base center: slightly inside the oval (6px) so body stroke hides the seam
  const innerOff = 6
  const bx = cx * viewBoxW + (rx * viewBoxW - innerOff) * cosθ
  const by = cy * viewBoxH + (ry * viewBoxH - innerOff) * sinθ

  // Perpendicular half-width of tail base (clockwise 90° from radius)
  const hw = (baseWidth * viewBoxW) / 2
  const p1x = bx + hw * sinθ
  const p1y = by - hw * cosθ
  const p2x = bx - hw * sinθ
  const p2y = by + hw * cosθ

  const tx = tipX * viewBoxW
  const ty = tipY * viewBoxH

  const d = `M ${p1x.toFixed(1)},${p1y.toFixed(1)} L ${tx.toFixed(1)},${ty.toFixed(1)} L ${p2x.toFixed(1)},${p2y.toFixed(1)} Z`

  return (
    <svg
      viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={d}
        fill="#ffffff"
        stroke="#242424"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
