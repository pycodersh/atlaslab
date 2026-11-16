import type { CSSProperties } from 'react'

/**
 * 홈 파노라마 두 장면(전통 · 일상 / K-컬처)이 함께 쓰는 펜화 도구.
 * 선:  m 외곽 1.2px 먹색  ·  d 세밀선 0.6px  ·  f 옅은 채색
 */

export const W = 1600, H = 400
export const PAPER = '#F7F5EE'
export const INK = '#262422'
export const RED = '#9E2B25'
export const INDIGO = '#2F3B5C'
export const OCHRE = '#B5874A'
export const GROUND = 300            // 길 높이

export const r1 = (n: number) => Math.round(n * 10) / 10
export function rng(seed: number) {   // 결정적 난수 — 서버 · 클라이언트가 같은 그림을 그린다
  let s = seed >>> 0
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

/** 원 하나(두 반원 호) */
export const circ = (cx: number, cy: number, r: number) =>
  `M${r1(cx - r)} ${r1(cy)} a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0 a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0 `

/* 두 장면이 공유하는 하늘 — 먼 능선 · 남산서울타워 · 소용돌이 구름 */
export const RIDGE = 'M470 214 C540 176 610 160 680 146 C740 132 800 106 852 106 C910 108 980 136 1050 156 C1100 170 1150 178 1200 184'
export const RIDGE_HATCH = 'M600 166 C660 150 720 140 760 128 M940 124 C1000 140 1060 156 1120 168 ' +
  Array.from({ length: 22 }, (_, i) => { const x = 620 + i * 24; const y = x < 852 ? 214 - (x - 470) * 0.28 : 106 + (x - 852) * 0.22; return `M${x} ${r1(y + 6)} l-5 9` }).join(' ')
export const TOWER = 'M842 108 L846 62 M856 108 L852 62 M836 62 H862 L858 54 H840 Z M842 54 V44 H856 V54 M849 44 V14'
export const TOWER_D = 'M846 70 H852 M845 80 H853 M844 90 H854 M845 100 H853'
export const CLOUD_A = 'M560 70 C566 56 588 52 596 62 C602 70 594 78 586 74 C580 70 584 64 590 66 M596 62 C606 50 628 52 632 64 C636 74 624 80 618 72 M560 70 H520 M632 64 C650 64 668 66 700 66 M548 78 H640'
export const CLOUD_B = 'M1010 52 C1016 38 1040 34 1048 46 C1054 56 1044 62 1036 58 C1030 54 1036 48 1042 50 M1048 46 C1060 36 1080 40 1082 52 C1084 62 1072 66 1068 58 M1010 52 H970 M1082 52 H1150 M1000 60 H1090'

export type Part = { k: 'm' | 'd' | 'f'; d: string; x: number; fill?: string; op?: number }

/** 그림 한 벌을 모으는 붓. 장면마다 하나씩 만든다. */
export function createInk() {
  const parts: Part[] = []
  const m = (d: string, x: number, fill?: string) => { parts.push({ k: 'm', d, x, fill }) }
  const dl = (d: string, x: number) => { parts.push({ k: 'd', d, x }) }
  const fl = (d: string, x: number, fill: string, op = 0.85) => { parts.push({ k: 'f', d, x, fill, op }) }

  /** 팔작지붕: 용마루 · 처마 끝이 들린 곡선 · 아래 처마선 · 기와골 · 서까래 끝 */
  function roof(x0: number, x1: number, yR: number, yE: number, over: number, lift: number, step = 6) {
    const inset = (x1 - x0) * 0.2
    const rl = x0 + inset, rr = x1 - inset
    const tl = x0 - over, tr = x1 + over, ty = yE - lift
    const out = `M${rl} ${yR} L${rr} ${yR} C${rr + (tr - rr) * 0.35} ${yR + (yE - yR) * 0.75} ${tr - over * 0.5} ${yE} ${tr} ${ty} ` +
      `C${tr - over * 0.4} ${yE + 6} ${x1 - 6} ${yE + 5} ${x1 - 20} ${yE + 4} L${x0 + 20} ${yE + 4} ` +
      `C${x0 + 6} ${yE + 5} ${tl + over * 0.4} ${yE + 6} ${tl} ${ty} C${tl + over * 0.5} ${yE} ${rl - (rl - tl) * 0.35} ${yR + (yE - yR) * 0.75} ${rl} ${yR} Z`
    m(out, (x0 + x1) / 2, PAPER)
    m(`M${rl - 4} ${yR - 4} L${rr + 4} ${yR - 4} M${rl - 4} ${yR - 4} C${rl - 10} ${yR - 8} ${rl - 12} ${yR - 14} ${rl - 8} ${yR - 18} M${rr + 4} ${yR - 4} C${rr + 10} ${yR - 8} ${rr + 12} ${yR - 14} ${rr + 8} ${yR - 18}`, (x0 + x1) / 2)
    dl(`M${rl - 2} ${yR - 2} L${rr + 2} ${yR - 2}`, (x0 + x1) / 2)
    let ribs = ''
    for (let x = rl + step / 2; x < rr; x += step) {
      const t = (x - rl) / (rr - rl)
      const ex = x0 + 18 + t * (x1 - x0 - 36)
      ribs += `M${r1(x)} ${yR + 1} C${r1(x)} ${r1(yR + (yE - yR) * 0.5)} ${r1(ex)} ${r1(yE - 6)} ${r1(ex)} ${yE + 2} `
    }
    for (let i = 1; i <= 5; i++) {
      const t = i / 6
      ribs += `M${r1(rl - (rl - x0 - 10) * t)} ${r1(yR + (yE - yR) * t * 0.9)} L${r1(x0 + 16 - t * 8)} ${yE + 2} `
      ribs += `M${r1(rr + (x1 - 10 - rr) * t)} ${r1(yR + (yE - yR) * t * 0.9)} L${r1(x1 - 16 + t * 8)} ${yE + 2} `
    }
    dl(ribs, (x0 + x1) / 2)
    let raft = ''
    for (let x = x0 + 24; x < x1 - 20; x += 9) raft += `M${x - 1.6} ${yE + 8} a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0 `
    dl(raft + ` M${x0 + 20} ${yE + 11} L${x1 - 20} ${yE + 11}`, (x0 + x1) / 2)
  }

  /** 띠살 · 격자 창호 */
  function lattice(x: number, y: number, w: number, h: number, cols: number, rows: number) {
    m(`M${x} ${y} H${x + w} V${y + h} H${x} Z`, x)
    let d = `M${x + 2} ${y + 2} H${x + w - 2} V${y + h - 2} H${x + 2} Z `
    for (let i = 1; i < cols; i++) d += `M${r1(x + (w * i) / cols)} ${y + 2} V${y + h - 2} `
    for (let j = 1; j < rows; j++) d += `M${x + 2} ${r1(y + (h * j) / rows)} H${x + w - 2} `
    dl(d, x)
  }

  /** 돌담 · 축대 — 결정적 난수로 고르지 않은 돌 */
  function stones(x0: number, x1: number, y0: number, y1: number, rowH: number, seed: number, mainTop = true) {
    const rand = rng(seed)
    let d = ''
    for (let y = y0; y < y1 - 2; y += rowH) {
      let x = x0 + (Math.floor((y - y0) / rowH) % 2 ? rand() * 10 : 0)
      while (x < x1 - 6) {
        const w = 14 + rand() * 18, h = Math.min(rowH - 2, y1 - y - 2)
        const xe = Math.min(x + w, x1 - 2)
        d += `M${r1(x + 3)} ${r1(y + 1.5)} L${r1(xe - 3)} ${r1(y + 1 + rand())} Q${r1(xe)} ${r1(y + 2)} ${r1(xe - 0.5)} ${r1(y + h / 2)} Q${r1(xe)} ${r1(y + h - 1)} ${r1(xe - 3)} ${r1(y + h)} L${r1(x + 3)} ${r1(y + h - rand())} Q${r1(x)} ${r1(y + h - 1)} ${r1(x + 0.5)} ${r1(y + h / 2)} Q${r1(x)} ${r1(y + 2)} ${r1(x + 3)} ${r1(y + 1.5)} `
        x = xe + 1.5
      }
    }
    dl(d, (x0 + x1) / 2)
    if (mainTop) m(`M${x0} ${y0} H${x1}`, (x0 + x1) / 2)
  }

  /** 앉은 사람(옆모습) — dir 1 오른쪽을 본다 */
  function seated(x: number, y: number, dir: 1 | -1, cloth: string, hair = INK) {
    const s = (v: number) => x + v * dir
    fl(`M${s(-7)} ${y - 26} C${s(-9)} ${y - 14} ${s(-9)} ${y - 4} ${s(-6)} ${y} L${s(12)} ${y} C${s(14)} ${y - 4} ${s(10)} ${y - 8} ${s(6)} ${y - 10} C${s(4)} ${y - 18} ${s(4)} ${y - 24} ${s(2)} ${y - 28} Z`, x, cloth)
    m(`M${s(-7)} ${y - 26} C${s(-9)} ${y - 14} ${s(-9)} ${y - 4} ${s(-6)} ${y} L${s(12)} ${y} C${s(14)} ${y - 4} ${s(10)} ${y - 8} ${s(6)} ${y - 10} C${s(4)} ${y - 18} ${s(4)} ${y - 24} ${s(2)} ${y - 28}`, x)
    m(`M${s(-2.5)} ${y - 31} a5.5 5.5 0 1 0 0.1 0`, x, PAPER)
    fl(`M${s(-6)} ${y - 34} C${s(-6)} ${y - 41} ${s(4)} ${y - 42} ${s(4)} ${y - 35} C${s(1)} ${y - 37} ${s(-3)} ${y - 36} ${s(-6)} ${y - 32} Z`, x, hair, 0.9)
    m(`M${s(0)} ${y - 22} C${s(5)} ${y - 16} ${s(10)} ${y - 14} ${s(16)} ${y - 15}`, x)
  }

  return { parts, m, dl, fl, roof, lattice, stones, seated }
}

/** 왼쪽부터 번지는 등장 지연 */
export const delay = (x: number, base: number) => `${(base + (x / W) * 2.4).toFixed(2)}s`

/** 모은 획을 그린다. drawIn 이면 외곽선이 왼쪽부터 그려지고 세밀선 · 채색이 뒤따라 스민다. */
export function InkParts({ parts, drawIn = false }: { parts: Part[]; drawIn?: boolean }) {
  return (
    <>
      {parts.map((p, i) => p.k === 'm' ? (
        <path key={i} className={drawIn ? 'hp-m hp-draw' : 'hp-m'} d={p.d} pathLength={drawIn ? 1 : undefined} vectorEffect="non-scaling-stroke"
          style={{ '--s': drawIn ? delay(p.x, 0) : undefined, fill: p.fill ?? 'none' } as CSSProperties} />
      ) : p.k === 'd' ? (
        <path key={i} className={drawIn ? 'hp-d hp-fade' : 'hp-d'} d={p.d} vectorEffect="non-scaling-stroke"
          style={drawIn ? ({ '--s': delay(p.x, 0.7) } as CSSProperties) : undefined} />
      ) : (
        <path key={i} className={drawIn ? 'hp-f hp-fade' : 'hp-f'} d={p.d}
          style={{ '--s': drawIn ? delay(p.x, 1.1) : undefined, fill: p.fill, fillOpacity: p.op } as CSSProperties} />
      ))}
    </>
  )
}
