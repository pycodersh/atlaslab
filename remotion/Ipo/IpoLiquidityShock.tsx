/**
 * 「사상 최대 IPO가 터졌는데 나스닥이 하락한 진짜 이유」 — 에디토리얼 브리핑 쇼츠 (1080×1920, 30fps, ≈57초)
 *
 * 관점   빅테크의 AI 투자 청구서가 결국 개인의 ETF 계좌로 넘어오고 있다
 * 틀     remotion/Editorial/kit.tsx (지면 · 머리 · 자막 · 전환 · 타이밍), 여기는 씬별 카드만
 * 대본   remotion/Ipo/lines.json
 * 음성   python scripts/bullbear/generate-voice.py ipo → 도윤, 템포 0.93, 문장 사이 0.35초
 * 렌더   npm run render:ipo → out/remotion/ipo-liquidity-shock.mp4
 *
 * 수치 확인(2026-11-21 보도 기준): 조달액 813억 달러, 나스닥100 Fast Entry 15거래일 — 확인.
 * 나스닥 하루 낙폭은 요청의 -5.2% 가 아니라 보도상 약 2%(최대 2.3%) → 「2% 넘게」로 썼다.
 * 보호예수는 한 번에 풀리지 않고 단계적(27일째 일부 해제) → 「27일째부터 풀린다」로 썼다.
 * 신규 주식 발행 2,760억 달러는 요청 자료 그대로(출처 미확인).
 */
import { C, EditorialBriefing, EditorialOutro, Highlight, Kicker, SANS, SERIF, Steps, editorialConfig, ease, type BoardProps, type Clip, type EditorialScene } from '../Editorial/kit'
import AUDIO from './audio.generated.json'
import LINES from './lines.json'

const scenesData = LINES as EditorialScene[]
const clips = AUDIO as Clip[]

export const IPO_SHOCK = editorialConfig(scenesData, clips)

const TICKS = [
  { k: 'ANT IPO', v: '$813억', up: true },
  { k: 'NASDAQ', v: '−2%대', up: false },
  { k: '신주 발행', v: '$2,760억', up: true },
  { k: 'NDX 편입', v: '15거래일', up: true },
  { k: '보호예수', v: '27일째 해제', up: false },
]

// Scene 1 — 사상 최대 조달 vs 지수 하락, 수급의 블랙홀
function ParadoxCard({ f, len }: { f: number; len: number }) {
  const raised = 813 * ease(f, 8, 40)
  const drop = ease(f, len * 0.3, len * 0.42)
  const flow = ease(f, len * 0.45, len * 0.75)
  const bars = [210, 180, 240, 160, 200, 150]
  return (
    <g>
      <Kicker x={60} y={80}>2026.11 · 앤스로픽 상장</Kicker>
      <text x={60} y={150} fontFamily={SANS} fontWeight={700} fontSize={28} fill={C.mute}>IPO 조달액</text>
      <text x={60} y={250} fontFamily={SERIF} fontWeight={900} fontSize={96} fill={C.ink}>{Math.round(raised)}억<tspan fontSize={48}> 달러</tspan></text>
      <text x={60} y={296} fontFamily={SANS} fontWeight={600} fontSize={24} fill={C.amber} opacity={ease(f, 36, 48)}>사상 최대 규모</text>
      <line x1={540} x2={540} y1={120} y2={300} stroke={C.rule} strokeWidth={1} />
      <g opacity={drop} transform={`translate(0 ${(1 - drop) * 12})`}>
        <text x={580} y={150} fontFamily={SANS} fontWeight={700} fontSize={28} fill={C.mute}>나스닥 · 하루</text>
        <text x={580} y={250} fontFamily={SERIF} fontWeight={900} fontSize={96} fill={C.crimson}>−2%<tspan fontSize={48}>대</tspan></text>
        <text x={580} y={296} fontFamily={SANS} fontWeight={600} fontSize={24} fill={C.crimson}>상장 주간 급락</text>
      </g>
      <line x1={60} x2={900} y1={360} y2={360} stroke={C.ink} strokeWidth={1} opacity={flow} />
      {/* 개념도 — 기존 종목에서 빠진 돈이 새 상장주로 */}
      <g opacity={flow}>
        <text x={60} y={420} fontFamily={SANS} fontWeight={700} fontSize={24} fill={C.mute}>기존 종목</text>
        {bars.map((h, i) => {
          const hh = h * (1 - 0.32 * flow)
          return <rect key={i} x={60 + i * 52} y={740 - hh} width={32} height={hh} fill={C.faint} />
        })}
        <line x1={60} x2={360} y1={740} y2={740} stroke={C.ink} strokeWidth={1} />
        <path d="M390,600 C470,600 520,560 600,560" fill="none" stroke={C.crimson} strokeWidth={2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - flow} markerEnd={flow > 0.95 ? 'url(#tipRed)' : undefined} />
        <text x={500} y={620} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={24} fill={C.crimson}>자금 이동</text>
        <text x={700} y={420} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={24} fill={C.mute}>신규 상장주</text>
        <rect x={640} y={740 - 300 * flow} width={120} height={300 * flow} fill={C.ink} />
        <line x1={620} x2={780} y1={740} y2={740} stroke={C.ink} strokeWidth={1} />
      </g>
      <text x={60} y={820} fontFamily={SERIF} fontWeight={900} fontSize={42} fill={C.ink} opacity={ease(f, len * 0.7, len * 0.82)}>호재가 아니라, 수급의 블랙홀</text>
      <text x={60} y={866} fontFamily={SANS} fontSize={20} fill={C.faint}>막대는 개념도 · 자료: CNBC 등 보도</text>
    </g>
  )
}

// Scene 2 — 기업 자금 조달 3단계
function FundingCard({ f, len }: { f: number; len: number }) {
  const strike = ease(f, len * 0.62, len * 0.74)
  const next = ease(f, len * 0.72, len * 0.86)
  return (
    <g>
      <Kicker x={60} y={80}>기업 자금 조달 3단계</Kicker>
      <Steps f={f} len={len * 0.9} top={120} rowH={128} items={[
        { t: '내부 현금', s: '번 돈으로 자사주 소각 · 주가 부양' },
        { t: '회사채', s: 'AI 데이터센터 투자로 부채 급증' },
        { t: '신규 주식 발행 $2,760억', s: '올해 · 마지막 지갑은 대중의 돈' },
      ]} />
      <line x1={60} x2={900} y1={540} y2={540} stroke={C.ink} strokeWidth={1} opacity={strike} />
      <g opacity={Math.max(strike, 0.001)}>
        <text x={60} y={640} fontFamily={SERIF} fontWeight={700} fontSize={44} fill={C.faint}>자사주 소각의 시대</text>
        <line x1={56} x2={56 + 400 * strike} y1={626} y2={626} stroke={C.crimson} strokeWidth={4} />
      </g>
      <g opacity={next} transform={`translate(0 ${(1 - next) * 12})`}>
        <text x={60} y={760} fontFamily={SERIF} fontWeight={900} fontSize={60} fill={C.ink}>
          <tspan fill={C.crimson}>주식 공급 과잉</tspan>의 시대
        </text>
      </g>
      <text x={60} y={866} fontFamily={SANS} fontSize={20} fill={C.faint}>신규 주식 발행 규모는 제작 자료 기준</text>
    </g>
  )
}

// Scene 3 — 15거래일 편입 × 27일째 해제, ETF 적립금이 출구가 되는 구조
function TimelineCard({ f, len }: { f: number; len: number }) {
  const x0 = 90, x1 = 870
  const X = (d: number) => x0 + (d / 32) * (x1 - x0)
  const axis = ease(f, 6, 30)
  const marks = [
    { d: 0, top: '상장', bot: 'D+0', col: C.ink, at: 12 },
    { d: 21, top: '나스닥100 편입', bot: '15거래일', col: C.amber, at: len * 0.28 },
    { d: 27, top: '내부자 물량 해제', bot: '27일째부터', col: C.crimson, at: len * 0.38 },
  ]
  const flow = ease(f, len * 0.52, len * 0.75)
  const box = (x: number, label: string, sub: string, col: string, p: number) => (
    <g opacity={p} transform={`translate(${x} ${560 + (1 - p) * 12})`}>
      <rect width={250} height={150} fill={C.card} stroke={col} strokeWidth={1.5} />
      <text x={125} y={66} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={col}>{label}</text>
      <text x={125} y={108} textAnchor="middle" fontFamily={SANS} fontWeight={500} fontSize={22} fill={C.mute}>{sub}</text>
    </g>
  )
  return (
    <g>
      <Kicker x={60} y={80}>상장 이후 타임라인</Kicker>
      <line x1={x0} x2={x0 + (x1 - x0) * axis} y1={290} y2={290} stroke={C.ink} strokeWidth={2} />
      {/* 21일(15거래일)과 27일은 엿새 차이라 라벨이 겹친다(1차 렌더) — 15거래일은 축 위, 27일째는 축 아래에 */}
      {marks.map(m => {
        const p = ease(f, m.at, m.at + 14)
        const anchor = m.d === 0 ? 'start' : 'middle'
        const below = m.d === 27
        return (
          <g key={m.d} opacity={p}>
            <line x1={X(m.d)} x2={X(m.d)} y1={272} y2={308} stroke={m.col} strokeWidth={3} />
            {m.d === 0 ? (
              <>
                <text x={X(0)} y={238} textAnchor={anchor} fontFamily={SANS} fontWeight={800} fontSize={30} fill={m.col}>{m.top}</text>
                <text x={X(0)} y={352} textAnchor={anchor} fontFamily={SERIF} fontWeight={700} fontSize={28} fill={m.col}>{m.bot}</text>
              </>
            ) : below ? (
              <>
                <text x={X(m.d)} y={352} textAnchor={anchor} fontFamily={SERIF} fontWeight={700} fontSize={28} fill={m.col}>{m.bot}</text>
                <text x={X(m.d)} y={394} textAnchor={anchor} fontFamily={SANS} fontWeight={800} fontSize={30} fill={m.col}>{m.top}</text>
              </>
            ) : (
              <>
                <text x={X(m.d)} y={196} textAnchor={anchor} fontFamily={SANS} fontWeight={800} fontSize={30} fill={m.col}>{m.top}</text>
                <text x={X(m.d)} y={238} textAnchor={anchor} fontFamily={SERIF} fontWeight={700} fontSize={28} fill={m.col}>{m.bot}</text>
              </>
            )}
          </g>
        )
      })}
      <rect x={X(21)} y={282} width={(X(27) - X(21)) * ease(f, len * 0.4, len * 0.5)} height={16} fill="rgba(185,28,28,0.18)" />
      <line x1={60} x2={900} y1={450} y2={450} stroke={C.rule} strokeWidth={1} opacity={flow} />
      <text x={60} y={530} fontFamily={SANS} fontWeight={700} fontSize={24} fill={C.mute} opacity={flow}>누가 사고, 누가 파나</text>
      {box(60, '개인 ETF 적립금', 'QQQ 등 · 편입 매수', C.ink, ease(f, len * 0.52, len * 0.6))}
      {box(355, '신규 상장주', '지수 편입 종목', C.amber, ease(f, len * 0.56, len * 0.64))}
      {box(650, '초기 투자자', '내부자 · 기관 매도', C.crimson, ease(f, len * 0.6, len * 0.68))}
      <line x1={312} x2={312 + 38 * flow} y1={635} y2={635} stroke={C.ink} strokeWidth={2} markerEnd={flow > 0.95 ? 'url(#tip)' : undefined} />
      <line x1={648} x2={648 - 38 * flow} y1={635} y2={635} stroke={C.crimson} strokeWidth={2} markerEnd={flow > 0.95 ? 'url(#tipRed)' : undefined} />
      <text x={60} y={800} fontFamily={SERIF} fontWeight={900} fontSize={40} fill={C.ink} opacity={ease(f, len * 0.72, len * 0.84)}>개인의 적립금이, 초기 투자자의 출구</text>
      <text x={60} y={866} fontFamily={SANS} fontSize={20} fill={C.faint}>자료: Nasdaq Fast Entry 규칙 · 보호예수는 단계적 해제</text>
    </g>
  )
}

// Scene 4 — 실전 체크포인트 3가지
function ChecklistCard({ f, len }: { f: number; len: number }) {
  const rows = [
    { t: '상장 직후 추격 매수 금지', s: '편입 수요는 이미 가격에 반영된다' },
    { t: '보호예수 해제일 확인', s: '해제 물량이 나오는 날짜를 캘린더에' },
    { t: '현금 비중 유지 · 분할 접근', s: '한 번에 사지 않고, 나눠서' },
  ]
  const each = (len * 0.6) / rows.length
  return (
    <g>
      <Kicker x={60} y={80}>대형 IPO 구간 체크포인트</Kicker>
      {rows.map((r, i) => {
        const at = len * 0.25 + i * each
        const p = ease(f, at, at + 16)
        const tick = ease(f, at + 10, at + 26)
        const y = 140 + i * 210
        return (
          <g key={i} opacity={Math.max(p, 0.18)} transform={`translate(0 ${(1 - p) * 12})`}>
            {i > 0 && <line x1={60} x2={900} y1={y - 30} y2={y - 30} stroke={C.rule} strokeWidth={1} />}
            <text x={60} y={y + 76} fontFamily={SERIF} fontWeight={900} fontSize={88} fill={C.crimson}>{i + 1}</text>
            <text x={160} y={y + 52} fontFamily={SANS} fontWeight={800} fontSize={42} fill={C.ink}>{r.t}</text>
            <text x={160} y={y + 100} fontFamily={SANS} fontWeight={500} fontSize={28} fill={C.mute}>{r.s}</text>
            <path d={`M840,${y + 44} L862,${y + 66} L900,${y + 22}`} fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - tick} />
          </g>
        )
      })}
      <text x={60} y={866} fontFamily={SANS} fontSize={20} fill={C.faint}>투자 권유가 아닌 일반적인 위험 관리 원칙</text>
    </g>
  )
}

function Board({ kind, f, len }: BoardProps) {
  if (kind === 'paradox') return <ParadoxCard f={f} len={len} />
  if (kind === 'funding') return <FundingCard f={f} len={len} />
  if (kind === 'timeline') return <TimelineCard f={f} len={len} />
  if (kind === 'checklist') return <ChecklistCard f={f} len={len} />
  return null
}

function Outro({ f }: { f: number }) {
  return (
    <EditorialOutro f={f} label="핵심 해석" note={<>※ 투자 권유가 아닌 시장 해설입니다.<br />자료: CNBC · Nasdaq 등 공개 보도, 2026년 11월 기준</>}>
      빅테크의 AI 청구서가,<br />개인의 <Highlight p={ease(f, 24, 44)}>ETF 계좌</Highlight>로<br />넘어오고 있다
    </EditorialOutro>
  )
}

export function IpoLiquidityShock() {
  return (
    <EditorialBriefing
      scenesData={scenesData}
      clips={clips}
      ticks={TICKS}
      tickW={360}
      mastRight="IPO 수급 리포트"
      footRight="시장 해설 · 투자 권유 아님"
      Board={Board}
      Outro={Outro}
    />
  )
}
