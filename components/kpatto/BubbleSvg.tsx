import React from 'react'
import type { BubbleTailData } from '@/data/kpatto/webtoon-types'

interface OvalParams {
  cx: number; cy: number; rx: number; ry: number
}

interface BubbleSvgProps {
  viewBoxW?: number
  viewBoxH?: number
  oval: OvalParams
  tail?: BubbleTailData
  flip?: boolean
  flipY?: boolean
  highlighted?: boolean
  thought?: boolean
}

/**
 * Computes a single closed SVG path that merges the oval body and tail into one shape.
 *
 * Algorithm:
 * 1. Find two base points (P1, P2) on the ellipse flanking the tail anchor angle.
 *    They sit on the tangent line at the anchor, projected back onto the ellipse.
 * 2. Build path: M P1 → large CW arc (body) → P2 → L tip → Z
 *
 * P1 is in the +tangent direction from the anchor (higher θ), P2 in the -tangent
 * direction (lower θ). The CW arc from P1 to P2 with large-arc=1 sweeps the body
 * portion (≈360° - 2dθ), avoiding the tail zone at θ. Stroke and fill are then
 * continuous across the entire shape with no seam.
 */
function computePath(
  W: number,
  H: number,
  oval: OvalParams,
  tail?: BubbleTailData,
): string {
  const { cx, cy, rx, ry } = oval
  const oRx = rx * W
  const oRy = ry * H
  const oCx = cx * W
  const oCy = cy * H

  if (!tail) {
    // Pure ellipse: two 180° arcs forming a closed shape
    return [
      `M ${f(oCx + oRx)},${f(oCy)}`,
      `A ${f(oRx)},${f(oRy)},0,1,1,${f(oCx - oRx)},${f(oCy)}`,
      `A ${f(oRx)},${f(oRy)},0,1,1,${f(oCx + oRx)},${f(oCy)}`,
      `Z`,
    ].join(' ')
  }

  const { anchor, tipX, tipY, baseWidth } = tail
  const θ = anchor * 2 * Math.PI
  const cosθ = Math.cos(θ)
  const sinθ = Math.sin(θ)

  // Unit tangent at θ in the CW (increasing-θ) direction
  const dtx = -oRx * sinθ
  const dty =  oRy * cosθ
  const dtLen = Math.sqrt(dtx * dtx + dty * dty)
  const tx = dtLen > 0 ? dtx / dtLen : 1
  const ty = dtLen > 0 ? dty / dtLen : 0

  // Base half-width in viewBox px
  const hw = (baseWidth * W) / 2

  // Approximate base points on the tangent line through the anchor
  const anchorX = oCx + oRx * cosθ
  const anchorY = oCy + oRy * sinθ
  const P1ax = anchorX + hw * tx   // +tangent direction → higher θ
  const P1ay = anchorY + hw * ty
  const P2ax = anchorX - hw * tx   // −tangent direction → lower θ
  const P2ay = anchorY - hw * ty

  // Project approximated base points back onto the ellipse
  const θ1 = Math.atan2((P1ay - oCy) / oRy, (P1ax - oCx) / oRx)
  const θ2 = Math.atan2((P2ay - oCy) / oRy, (P2ax - oCx) / oRx)

  const P1x = oCx + oRx * Math.cos(θ1)
  const P1y = oCy + oRy * Math.sin(θ1)
  const P2x = oCx + oRx * Math.cos(θ2)
  const P2y = oCy + oRy * Math.sin(θ2)

  const Tx = tipX * W
  const Ty = tipY * H

  // M P1 → large CW arc (body) → P2 → L Tip → Z
  return [
    `M ${f(P1x)},${f(P1y)}`,
    `A ${f(oRx)},${f(oRy)},0,1,1,${f(P2x)},${f(P2y)}`,
    `L ${f(Tx)},${f(Ty)}`,
    `Z`,
  ].join(' ')
}

function f(n: number) {
  return n.toFixed(2)
}

const SVG_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  overflow: 'visible',
  pointerEvents: 'none',
}

export function BubbleSvg({
  viewBoxW = 320,
  viewBoxH = 200,
  oval,
  tail,
  flip,
  flipY,
  highlighted,
  thought = false,
}: BubbleSvgProps) {
  const fill = highlighted ? '#FFF8F0' : '#ffffff'
  const stroke = highlighted ? '#D4873A' : '#242424'
  const sw = highlighted ? 3 : 2.5

  const parts: string[] = []
  if (flip)  parts.push(`scale(-1,1) translate(${-viewBoxW},0)`)
  if (flipY) parts.push(`scale(1,-1) translate(0,${-viewBoxH})`)
  const transform = parts.length ? parts.join(' ') : undefined

  if (thought) {
    const { cx, cy, rx, ry } = oval
    const oRx = rx * viewBoxW
    const oRy = ry * viewBoxH
    const oCx = cx * viewBoxW
    const oCy = cy * viewBoxH

    const ovalPath = [
      `M ${f(oCx + oRx)},${f(oCy)}`,
      `A ${f(oRx)},${f(oRy)},0,1,1,${f(oCx - oRx)},${f(oCy)}`,
      `A ${f(oRx)},${f(oRy)},0,1,1,${f(oCx + oRx)},${f(oCy)}`,
      `Z`,
    ].join(' ')

    // Compute 3 decreasing circles along the tail direction (r=8→5→3)
    let circles: Array<{ cx: number; cy: number; r: number }> = []
    const t = tail ?? { anchor: 0.25, tipX: 0.5, tipY: 1.3, baseWidth: 0.12 }
    const θ = t.anchor * 2 * Math.PI
    const anchorX = oCx + oRx * Math.cos(θ)
    const anchorY = oCy + oRy * Math.sin(θ)
    const dx = t.tipX * viewBoxW - anchorX
    const dy = t.tipY * viewBoxH - anchorY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const ux = dist > 0 ? dx / dist : 0
    const uy = dist > 0 ? dy / dist : 1
    circles = [
      { cx: anchorX + ux * 18, cy: anchorY + uy * 18, r: 8 },
      { cx: anchorX + ux * 32, cy: anchorY + uy * 32, r: 5 },
      { cx: anchorX + ux * 43, cy: anchorY + uy * 43, r: 3 },
    ]

    return (
      <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} style={SVG_STYLE} xmlns="http://www.w3.org/2000/svg">
        <g transform={transform}>
          <path d={ovalPath} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          {circles.map((c, i) => (
            <circle key={i} cx={f(c.cx)} cy={f(c.cy)} r={c.r} fill={fill} stroke={stroke} strokeWidth={sw} />
          ))}
        </g>
      </svg>
    )
  }

  const d = computePath(viewBoxW, viewBoxH, oval, tail)

  return (
    <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} style={SVG_STYLE} xmlns="http://www.w3.org/2000/svg">
      <path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        transform={transform}
      />
    </svg>
  )
}
