/**
 * 매크로 브리핑 · 에디토리얼판 — 경제 잡지 톤의 밝은 브리핑 (1080×1920, 30fps, 음성 길이에 맞춰)
 *
 * 다크 터미널판(ProAnalystBriefing)과 같은 내용을 밝은 지면 · 세리프 헤드라인 · 미니멀 선 그래프로 다시 짰다.
 * 틀(지면 · 머리 · 자막 · 전환 · 타이밍)은 remotion/Editorial/kit.tsx, 여기는 씬별 카드만.
 * 대본   remotion/ProAnalyst/lines-light.json — 씬마다 sentences(문장 = 음성 클립 1개), amber/crimson = 형광펜 밑줄 용어
 * 음성   python scripts/bullbear/generate-voice.py pro-light → 도윤(차분한 해설 톤), 템포 0.93
 * 렌더   npm run render:pro-light → out/remotion/pro-analyst-light.mp4
 */
import { C, EditorialBriefing, EditorialOutro, Highlight, Kicker, SANS, SERIF, Steps, editorialConfig, ease, fmt, type BoardProps, type Clip, type EditorialScene } from '../Editorial/kit'
import AUDIO from './audio-light.generated.json'
import LINES from './lines-light.json'

const scenesData = LINES as EditorialScene[]
const clips = AUDIO as Clip[]

export const PRO_LIGHT = editorialConfig(scenesData, clips)

const TICKS = [
  { k: 'KOSPI', v: '5,000', up: false },
  { k: 'NASDAQ', v: '−5.2%', up: false },
  { k: 'NVDA', v: '−14.1%', up: false },
  { k: 'FED', v: '+50bp', up: true },
  { k: 'GOLD', v: '연중 최저', up: false },
  { k: 'BTC', v: '연중 최저', up: false },
]

const KOSPI = [6000, 6250, 6150, 6500, 6800, 6700, 7100, 7450, 7300, 7800, 8200, 8100, 8600, 9050, 8500, 7800, 7900, 7100, 6300, 6500, 5600, 4980]
function KospiCard({ f, len }: { f: number; len: number }) {
  const top = 300, bottom = 800, lo = 4500, hi = 9500, x0 = 60, x1 = 840
  const X = (i: number) => x0 + (i / (KOSPI.length - 1)) * (x1 - x0)
  const Y = (v: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top)
  const peak = KOSPI.indexOf(Math.max(...KOSPI))
  const p = ease(f, 10, len * 0.7) * (KOSPI.length - 1)
  const k = Math.floor(p)
  const live = k >= KOSPI.length - 1 ? KOSPI[KOSPI.length - 1] : KOSPI[k] + (KOSPI[k + 1] - KOSPI[k]) * (p - k)
  const rise = KOSPI.slice(0, Math.min(k, peak) + 1).map((v, i) => `${X(i)},${Y(v)}`)
  if (p < peak) rise.push(`${X(p)},${Y(live)}`)
  const fall = p > peak ? KOSPI.slice(peak, k + 1).map((v, i) => `${X(peak + i)},${Y(v)}`) : []
  if (p > peak && k < KOSPI.length - 1) fall.push(`${X(p)},${Y(live)}`)
  const done = p >= KOSPI.length - 1.01
  const tag = ease(f, len * 0.7, len * 0.8)
  return (
    <g>
      <Kicker x={60} y={80}>KOSPI · 지수</Kicker>
      <text x={60} y={190} fontFamily={SERIF} fontWeight={900} fontSize={104} fill={p > peak ? C.crimson : C.ink}>{fmt(done ? 5000 : live)}</text>
      <g opacity={tag}>
        <text x={900} y={190} textAnchor="end" fontFamily={SERIF} fontWeight={900} fontSize={72} fill={C.crimson}>−44.4%</text>
      </g>
      <text x={60} y={240} fontFamily={SANS} fontWeight={600} fontSize={28} fill={C.mute}>9,000 돌파 이후 5,000 붕괴</text>
      {[5000, 7000, 9000].map(v => (
        <g key={v}>
          <line x1={x0} x2={x1 + 20} y1={Y(v)} y2={Y(v)} stroke={v === 5000 ? C.crimson : C.rule} strokeWidth={1} strokeDasharray={v === 5000 ? '6 6' : undefined} />
          <text x={900} y={Y(v) + 8} textAnchor="end" fontFamily={SANS} fontWeight={600} fontSize={22} fill={v === 5000 ? C.crimson : C.faint}>{fmt(v)}</text>
        </g>
      ))}
      <polyline points={rise.join(' ')} fill="none" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      {fall.length > 1 && <polyline points={fall.join(' ')} fill="none" stroke={C.crimson} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />}
      <circle cx={X(Math.min(p, KOSPI.length - 1))} cy={Y(live)} r={6} fill={p > peak ? C.crimson : C.ink} />
      <g opacity={ease(f, 10 + (len * 0.7 - 10) * (peak / (KOSPI.length - 1)), 10 + (len * 0.7 - 10) * (peak / (KOSPI.length - 1)) + 10)}>
        <line x1={X(peak)} x2={X(peak)} y1={Y(9050) - 12} y2={Y(9050) - 44} stroke={C.ink} strokeWidth={1} />
        <text x={X(peak)} y={Y(9050) - 54} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={24} fill={C.ink}>9,000 돌파</text>
      </g>
      <text x={60} y={860} fontFamily={SANS} fontSize={20} fill={C.faint}>가상 시뮬레이션 지수 · 일간</text>
    </g>
  )
}

function FedCard({ f, len }: { f: number; len: number }) {
  const g = (y: number, label: string, from: number, to: number, a: number, b: number, color: string, note: string) => {
    const t = ease(f, a, b)
    const w = 840 * (from + (to - from) * t)
    return (
      <g transform={`translate(60 ${y})`} opacity={ease(f, a - 10, a)}>
        <text x={0} y={0} fontFamily={SANS} fontWeight={700} fontSize={32} fill={C.ink}>{label}</text>
        <text x={840} y={0} textAnchor="end" fontFamily={SANS} fontWeight={700} fontSize={28} fill={color}>{note}</text>
        <line x1={0} x2={840} y1={34} y2={34} stroke={C.rule} strokeWidth={2} />
        <line x1={0} x2={w} y1={34} y2={34} stroke={color} strokeWidth={6} strokeLinecap="round" />
      </g>
    )
  }
  return (
    <g>
      <Kicker x={60} y={80}>연준 · 월러 이사</Kicker>
      <g opacity={ease(f, 6, 22)}>
        <text x={60} y={170} fontFamily={SERIF} fontWeight={700} fontSize={46} fill={C.body}>“12월에 한 번 더,</text>
        <text x={60} y={232} fontFamily={SERIF} fontWeight={700} fontSize={46} fill={C.body}>크게 올려야 한다”</text>
      </g>
      <g opacity={ease(f, 16, 34)} transform={`translate(0 ${(1 - ease(f, 16, 34)) * 16})`}>
        <text x={60} y={440} fontFamily={SERIF} fontWeight={900} fontSize={176} fill={C.crimson}>+50bp</text>
        <text x={66} y={492} fontFamily={SANS} fontWeight={600} fontSize={28} fill={C.mute}>12월 기준금리 인상 주장 · 빅스텝</text>
      </g>
      {g(620, '인플레이션 재점화 우려', 0.35, 0.9, len * 0.35, len * 0.6, C.crimson, '확대')}
      {g(760, '시장의 금리 인하 기대', 0.8, 0.12, len * 0.5, len * 0.82, C.ink, '소멸')}
      <text x={60} y={860} fontFamily={SANS} fontSize={20} fill={C.faint}>막대는 방향성만 표시</text>
    </g>
  )
}

/** 작은 하락 선 그래프 */
function Spark({ x, y, p, label }: { x: number; y: number; p: number; label: string }) {
  const pts = [[0, 20], [40, 14], [80, 30], [120, 24], [160, 48], [200, 44], [240, 70]]
  const n = Math.max(1, Math.floor(p * (pts.length - 1)))
  return (
    <g transform={`translate(${x} ${y})`} opacity={Math.min(1, p * 3)}>
      <text x={0} y={0} fontFamily={SANS} fontWeight={800} fontSize={32} fill={C.ink}>{label}</text>
      <text x={0} y={40} fontFamily={SANS} fontWeight={600} fontSize={24} fill={C.crimson}>연중 최저</text>
      <polyline transform="translate(170 -28)" points={pts.slice(0, n + 1).map(q => q.join(',')).join(' ')} fill="none" stroke={C.crimson} strokeWidth={2.5} strokeLinejoin="round" />
    </g>
  )
}

function FlowCard({ f, len }: { f: number; len: number }) {
  const t = len * 0.6
  return (
    <g>
      <Kicker x={60} y={80}>왜 안전자산까지 팔렸나</Kicker>
      <Steps f={f} len={len} top={120} items={[
        { t: '빅스텝 공포', s: '연준 +50bp 리스크가 가격에 반영' },
        { t: '유동성 경색', s: '레버리지와 단기자금이 동시에 위축' },
        { t: '마진콜과 현금화', s: '증거금이 부족하면 팔리는 것부터 매도' },
        { t: '금 · 비트코인 동반 투매', s: '안전자산도 현금 마련 창구가 된다' },
      ]} />
      <line x1={60} x2={900} y1={610} y2={610} stroke={C.ink} strokeWidth={1} opacity={ease(f, t, t + 10)} />
      <Spark x={60} y={680} p={ease(f, t, t + 30)} label="금" />
      <Spark x={500} y={680} p={ease(f, t + 8, t + 38)} label="비트코인" />
      <text x={480} y={830} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={52} fill={C.ink} opacity={ease(f, t + 24, t + 44)}>Cash is King</text>
    </g>
  )
}

function AiCard({ f, len }: { f: number; len: number }) {
  const rows = [
    { k: 'NVDA', v: -14.1, y: 300, d: 14, col: C.crimson },
    { k: 'NASDAQ', v: -5.2, y: 450, d: 26, col: '#E35D5D' },
  ]
  const scale = 34 // 1%p = 34px — NVDA 막대 끝에 값 라벨이 카드 안에 들어오게
  const note = ease(f, len * 0.5, len * 0.62)
  return (
    <g>
      <Kicker x={60} y={80}>하루 등락률</Kicker>
      <g opacity={ease(f, 4, 18)}>
        <text x={60} y={170} fontFamily={SERIF} fontWeight={700} fontSize={40} fill={C.body}>새 CEO 임명, 리더십 불확실성</text>
        <line x1={60} x2={60 + 520 * ease(f, 12, 30)} y1={186} y2={186} stroke={C.amber} strokeWidth={8} opacity={0.5} />
      </g>
      <line x1={220} x2={220} y1={250} y2={560} stroke={C.ink} strokeWidth={1.5} />
      <text x={220} y={590} textAnchor="middle" fontFamily={SANS} fontSize={20} fill={C.faint}>0%</text>
      {rows.map(r => {
        const t = ease(f, r.d, r.d + 34)
        const w = -r.v * scale * t
        return (
          <g key={r.k}>
            <text x={196} y={r.y + 48} textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize={32} fill={C.ink}>{r.k}</text>
            <rect x={222} y={r.y} width={w} height={74} fill={r.col} />
            <text x={222 + w + 16} y={r.y + 54} fontFamily={SERIF} fontWeight={900} fontSize={50} fill={r.col}>{(r.v * t).toFixed(1)}%</text>
          </g>
        )
      })}
      <g opacity={note} transform={`translate(60 ${660 + (1 - note) * 14})`}>
        <rect x={0} y={0} width={6} height={140} fill={C.crimson} />
        <text x={36} y={56} fontFamily={SANS} fontWeight={800} fontSize={36} fill={C.ink}>할인율 상승 · 밸류에이션 재평가</text>
        <text x={36} y={108} fontFamily={SANS} fontWeight={500} fontSize={28} fill={C.mute}>먼 미래 이익일수록 현재 가치가 크게 줄어든다</text>
      </g>
    </g>
  )
}

function KoreaCard({ f, len }: { f: number; len: number }) {
  const cells = [
    { t: '미 금리 인상', s: '연준 +50bp 압박', x: 60, y: 120 },
    { t: '한은 동결·압박', s: '인하 카드 봉쇄', x: 490, y: 120 },
    { t: '주담대 이자 상승', s: '가계부채 상환 부담', x: 490, y: 400 },
    { t: '부동산 하방 압력', s: '영끌 매물 · 가격 조정', x: 60, y: 400 },
  ]
  const cw = 410, ch = 250
  const each = (len * 0.5) / cells.length
  const links = [
    `M${60 + cw + 4},${120 + ch / 2} L${490 - 6},${120 + ch / 2}`,
    `M${490 + cw / 2},${120 + ch + 4} L${490 + cw / 2},${400 - 6}`,
    `M${490 - 4},${400 + ch / 2} L${60 + cw + 6},${400 + ch / 2}`,
  ]
  const end = ease(f, len * 0.6, len * 0.72)
  return (
    <g>
      <Kicker x={60} y={80}>국내 전이 경로</Kicker>
      {cells.map((c, i) => {
        const at = 8 + i * each
        const p = ease(f, at, at + 16)
        const last = i === cells.length - 1
        return (
          <g key={i}>
            {i > 0 && <path d={links[i - 1]} fill="none" stroke={C.ink} strokeWidth={1.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(f, at - 10, at)} markerEnd={f > at ? 'url(#tip)' : undefined} />}
            <g opacity={p} transform={`translate(${c.x} ${c.y + (1 - p) * 14})`}>
              <rect width={cw} height={ch} fill={last ? '#FEF2F2' : C.card} stroke={last ? C.crimson : C.rule} strokeWidth={1.5} />
              <text x={28} y={70} fontFamily={SERIF} fontWeight={900} fontSize={46} fill={last ? C.crimson : C.faint}>{i + 1}</text>
              <text x={28} y={150} fontFamily={SANS} fontWeight={800} fontSize={38} fill={last ? C.crimson : C.ink}>{c.t}</text>
              <text x={28} y={198} fontFamily={SANS} fontWeight={500} fontSize={26} fill={C.mute}>{c.s}</text>
            </g>
          </g>
        )
      })}
      <g opacity={end} transform={`translate(60 ${720 + (1 - end) * 14})`}>
        <rect x={0} y={0} width={6} height={120} fill={C.amber} />
        <text x={36} y={46} fontFamily={SANS} fontWeight={700} fontSize={24} letterSpacing={3} fill={C.amber}>결론</text>
        <text x={36} y={100} fontFamily={SERIF} fontWeight={900} fontSize={46} fill={C.ink}>수익률보다, 현금 비중 관리</text>
      </g>
    </g>
  )
}

function Board({ kind, f, len }: BoardProps) {
  if (kind === 'kospi') return <KospiCard f={f} len={len} />
  if (kind === 'fed') return <FedCard f={f} len={len} />
  if (kind === 'flow') return <FlowCard f={f} len={len} />
  if (kind === 'ai') return <AiCard f={f} len={len} />
  if (kind === 'korea') return <KoreaCard f={f} len={len} />
  return null
}

function Outro({ f }: { f: number }) {
  return (
    <EditorialOutro f={f} label="핵심 요약" note={<>※ 본 영상은 이해를 돕기 위한<br />가상 시황 시뮬레이션 해설입니다.</>}>
      유동성이 마르면,<br />안전자산도<br />
      <Highlight p={ease(f, 24, 44)}>현금화 대상</Highlight>이 된다
    </EditorialOutro>
  )
}

export function ProAnalystLight() {
  return (
    <EditorialBriefing
      scenesData={scenesData}
      clips={clips}
      ticks={TICKS}
      mastRight="가상 시황 시뮬레이션"
      footRight="가상 시황 시뮬레이션 · 투자 권유 아님"
      Board={Board}
      Outro={Outro}
    />
  )
}
