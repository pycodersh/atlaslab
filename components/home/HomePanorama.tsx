import type { CSSProperties, ReactNode } from 'react'

/**
 * 홈 히어로 바로 아래의 에디토리얼 펜화 파노라마 — 01 한국어 · 02 한국 음식 · 03 여행.
 *
 * 선은 세 종류다.
 *   m  주 윤곽선 1.4px (먹색 #1C1917) — 흰 바탕 위 펜화
 *   h  한글 획 1.1px — 붓글씨 획순처럼 한 획씩
 *   d  건축 · 질감 보조선 0.7px, 회색(#78716C)
 * 크림슨(#C81E32)은 낙관 · 수증기 · 여정 핀과 마지막 여정 점선에만 쓴다.
 *
 * 세 파트는 같은 높이의 지평선(y=200)과 여정 점선(y≈216)으로 이어져 한 폭처럼 보인다.
 * 그리기는 왼쪽 파트부터 차례로(pathLength=1 · stroke-dashoffset), 다 그린 뒤에는 수증기 · 점선 · 핀만 은은하게 돈다.
 * JS 없이 CSS 만 쓴다. 움직임 줄이기 설정이면 완성된 그림이 바로 보인다.
 * PC 는 3열 한 폭, 768px 미만은 파트별 가로 슬라이드(스크롤 스냅 — 페이지 자체는 가로로 넘치지 않는다).
 */

type Kind = 'm' | 'h' | 'd'
// [종류, d, 이전 선 시작에서 몇 초 뒤에 시작할지(기본 0.07), 그리는 시간(기본 0.9), 채움(가림용)]
type Line = [Kind, string, number?, number?, string?]

const BG = '#FFFFFF'      // 가림용 채움 = 바탕색
const INK = '#1C1917'
const GRAY = '#78716C'
const RED = '#C81E32'
const HORIZON = 'M0 200 H400'

// 기와 골 — 용마루(y0)에서 처마(y1)로 부채꼴로 퍼지는 짧은 선들
const tiles = (x0: number, x1: number, step: number, cx: number, y0: number, y1: number, spread: number) => {
  let d = ''
  for (let x = x0; x <= x1; x += step) d += `M${x} ${y0} L${(x + (x - cx) * spread).toFixed(1)} ${y1} `
  return d.trim()
}
// 책 왼쪽 면의 글줄
const pageLines = Array.from({ length: 6 }, (_, i) => {
  const y = 128 + i * 9
  return `M112 ${y + 1} C138 ${y - 5} 170 ${y - 4} 191 ${y + 4}`
}).join(' ')

const LANGUAGE: Line[] = [
  ['m', HORIZON, 0, 1.1],
  ['d', 'M34 206 H70 M118 206 H176 M228 206 H300 M338 206 H372'],
  // 펼친 책: 표지 · 왼쪽 면 · 오른쪽 면 · 책장 두께
  ['m', 'M88 197 C130 189 172 191 200 201 C228 191 270 189 312 197', 0.25],
  ['m', 'M200 196 C172 186 132 186 98 193 L102 118 C134 110 172 110 200 121 Z'],
  ['m', 'M200 196 C228 186 268 186 302 193 L298 118 C266 110 228 110 200 121'],
  ['d', 'M96 199 C130 192 172 194 200 204 C228 194 270 192 304 199 M200 121 V196'],
  ['d', pageLines],
  // 말풍선과 '가나'
  ['m', 'M58 34 H116 Q128 34 128 46 V72 Q128 84 116 84 H112 L120 102 L100 84 H58 Q46 84 46 72 V46 Q46 34 58 34 Z', 0.12],
  ['h', 'M62 48 H78 V68', 0.3, 0.3],
  ['h', 'M88 44 V74', 0.16, 0.25],
  ['h', 'M88 59 H96', 0.12, 0.2],
  ['h', 'M103 47 V65 H114', 0.14, 0.3],
  ['h', 'M119 44 V74 M119 59 H124', 0.14, 0.3],
  // 오른쪽 면의 한글 기하 패턴 — ㄱ ㄴ ㅇ / ㅁ ㅅ ㅎ, 획순대로
  ['h', 'M215 131 H231 V147', 0.14, 0.28],
  ['h', 'M243 130 V146 H259', 0.14, 0.28],
  ['h', 'M268 138 A8 8 0 1 0 284 138 A8 8 0 1 0 268 138', 0.14, 0.32],
  ['h', 'M216 158 H232 V174 H216 Z', 0.14, 0.32],
  ['h', 'M250 157 L241 175 M250 166 L259 175', 0.14, 0.28],
  ['h', 'M272 155 H280 M267 160 H285 M270 170 A6 6 0 1 0 282 170 A6 6 0 1 0 270 170', 0.14, 0.34],
  ['d', 'M212 152 H288 M238 124 V182 M264 124 V182'],
  // 붓
  ['m', 'M318 194 L360 156', 0.1],
  ['m', 'M360 156 C364 149 373 142 384 139 C380 148 373 155 365 160 Z'],
  ['d', 'M354 159 L362 167 M326 196 C334 197 342 196 350 194'],
]

const CUISINE: Line[] = [
  ['m', HORIZON, 0, 1.1],
  // 뒤쪽 창살
  ['d', 'M286 26 H372 V96 H286 Z M314 26 V96 M343 26 V96 M286 49 H372 M286 72 H372 M280 100 H378', 0.1],
  // 소반: 상판 · 테두리 · 다리
  ['m', 'M70 150 A130 16 0 1 0 330 150 A130 16 0 1 0 70 150', 0.15],
  ['m', 'M70 150 V157 A130 16 0 0 0 330 157 V150'],
  ['m', 'M98 170 C96 182 92 192 86 200 M302 170 C304 182 308 192 314 200'],
  ['d', 'M84 166 C120 178 160 182 200 182 C240 182 280 178 316 166 M150 172 L148 200 M250 172 L252 200 M92 190 H308'],
  // 뚝배기
  ['m', 'M122 146 C120 124 124 110 130 104 H190 C196 110 200 124 198 146 C180 150 140 150 122 146 Z', 0.12, 0.9, BG],
  ['m', 'M128 104 A32 6 0 1 0 192 104 A32 6 0 1 0 128 104'],
  ['d', 'M125 118 C146 122 174 122 195 118 M123 131 C146 135 174 135 197 131 M136 105 C150 108 170 108 184 105'],
  // 방짜유기: 뚜껑 · 꼭지 · 그릇 · 굽
  ['m', 'M226 120 H290 C288 136 276 146 258 146 C240 146 228 136 226 120 Z', 0.12, 0.9, BG],
  ['m', 'M226 120 C230 104 286 104 290 120'],
  ['m', 'M254 102 A4 4 0 1 0 262 102 A4 4 0 1 0 254 102 M248 146 V150 H268 V146'],
  ['d', 'M236 128 C240 136 248 140 256 141 M240 112 C246 108 254 107 262 107 M231 120 H285'],
  // 수저
  ['m', 'M240 157 L299 152 M299 152 C303 148 315 148 318 152 C315 156 303 156 299 152', 0.1],
  ['m', 'M236 161 L314 157 M238 164 L316 160'],
]

const TRAVEL: Line[] = [
  ['m', HORIZON, 0, 1.1],
  // 먼 남산 능선과 N서울타워
  // 능선은 앞 한옥 뒤에서 솟아 돌담 위로 내려앉는다(집 · 담을 가로지르지 않게)
  ['d', 'M246 160 C262 152 280 146 300 144 C326 142 352 150 374 160 C386 165 394 168 400 169', 0.1],
  ['d', 'M262 154 L267 164 M280 149 L285 160 M318 147 L323 158 M336 150 L341 160 M354 154 L358 163'],
  ['m', 'M297 148 V100 M303 148 V100 M291 100 H309 L306 90 H294 Z M296 90 V82 H304 V90 M300 82 V50'],
  // 뒤쪽 한옥 지붕(어두운 채움으로 뒤를 가린다)
  ['m', 'M146 98 H226 C236 112 254 122 278 122 C266 128 254 130 244 128 H128 C118 130 106 128 94 122 C118 122 136 112 146 98 Z', 0.12, 0.9, BG],
  ['d', tiles(152, 220, 8, 186, 100, 124, 0.8) + ' M142 94 L146 98 M226 98 L230 94'],
  ['m', 'M240 128 V176'],
  ['d', 'M206 136 H240 M206 150 H240'],
  // 앞쪽 한옥: 지붕 · 기둥 · 창살문
  ['m', 'M62 118 H138 C150 134 172 144 202 144 C188 152 172 154 160 152 H40 C28 154 14 152 2 144 C28 144 50 134 62 118 Z', 0.12, 0.9, BG],
  ['d', tiles(68, 132, 7, 100, 120, 146, 0.9) + ' M58 114 L62 118 M138 118 L142 114'],
  ['m', 'M44 152 V200 M156 152 V200'],
  ['d', 'M70 160 H130 V200 M70 160 V200 M90 160 V200 M110 160 V200 M70 173 H130 M70 186 H130'],
  // 돌담길
  ['m', 'M214 176 C260 172 330 174 400 170', 0.1],
  ['d', 'M216 188 C240 186 262 188 284 187 C306 186 330 188 352 186 C370 185 386 186 400 185 M240 175 V188 M268 175 V187 M300 175 V187 M334 174 V186 M362 172 V185 M226 188 V200 M254 188 V200 M286 187 V200 M318 187 V200 M348 186 V200 M380 185 V200'],
]

// 여정 점선 — 파트 경계(x=0 · 400)에서 같은 높이로 만나 한 줄로 이어진다
const TRAILS = [
  'M0 216 C80 222 160 210 240 214 C300 217 350 222 400 216',
  'M0 216 C70 211 140 222 210 216 C280 210 340 212 400 216',
  'M0 216 C60 220 120 212 190 216 C250 220 320 222 378 212',
]

const PART_GAP = 0.85   // 파트 사이 시작 간격(초)

function strokes(lines: Line[], base: number) {
  let t = base
  return lines.map(([k, d, gap = 0.07, dur = 0.9, fill], i) => {
    if (i > 0) t += gap
    return (
      <path key={i} className={`lp-${k} lp-draw`} d={d} pathLength={1} vectorEffect="non-scaling-stroke"
        style={{ '--s': `${t.toFixed(2)}s`, '--dur': `${dur}s`, fill: fill ?? 'none' } as CSSProperties} />
    )
  })
}
const at = (s: number) => ({ '--s': `${s.toFixed(2)}s` }) as CSSProperties

const PARTS: { no: string; label: string; aria: string; lines: Line[]; extra: (base: number) => ReactNode }[] = [
  {
    no: '01', label: 'Korean Language', lines: LANGUAGE,
    aria: 'An open book with Hangul letters, a speech bubble and a calligraphy brush',
    extra: base => (
      <g className="lp-seal" style={at(base + 2.3)} transform="rotate(-6 290 184)">
        <rect x="284" y="178" width="13" height="13" rx="1" fill={RED} />
        <path d="M287 181 H294 M290.5 181 V188 M287 188 H294" stroke={BG} strokeWidth="1.2" fill="none" />
      </g>
    ),
  },
  {
    no: '02', label: 'Korean Cuisine', lines: CUISINE,
    aria: 'A ttukbaegi stew pot, a brass bangjja bowl and spoon and chopsticks on a small soban table, with steam rising',
    extra: base => (
      <g>
        {['M146 94 C140 84 152 76 146 64 C140 54 150 46 146 38', 'M160 92 C154 80 166 72 160 58 C154 48 164 40 160 30', 'M174 94 C168 84 180 76 174 64 C168 54 178 46 174 38'].map((d, i) => (
          <path key={d} className="lp-steam" d={d} vectorEffect="non-scaling-stroke" style={at(base + 1.7 + i * 0.9)} />
        ))}
      </g>
    ),
  },
  {
    no: '03', label: 'Local Travel', lines: TRAVEL,
    aria: 'Layered hanok roofs, a stone wall lane and N Seoul Tower on Namsan, with a dotted walking route to a map pin',
    extra: base => (
      <g className="lp-pin" style={at(base + 1.9)}>
        <path d="M378 212 C372 202 366 194 366 186 A12 12 0 1 1 390 186 C390 194 384 202 378 212 Z" fill={BG} stroke={RED} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        <circle cx="378" cy="186" r="4" fill={RED} />
      </g>
    ),
  },
]

export function HomePanorama() {
  return (
    <section className="lp" aria-label="Korean language, cuisine and travel">
      <style>{`
        .lp { background: ${BG}; border-bottom: 1px solid #E7E5E4; }
        .lp-inner { max-width: 1152px; margin: 0 auto; padding: 26px 24px 22px; }
        .lp-track { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .lp-part { position: relative; margin: 0; padding: 0 0 4px; }
        .lp-part::before {
          content: ''; position: absolute; inset: 0 6px; pointer-events: none;
          background: radial-gradient(60% 55% at 50% 48%, rgba(28,25,23,0.045), transparent 70%);
          opacity: 0; transition: opacity .4s ease;
        }
        .lp-part svg { display: block; width: 100%; height: auto; overflow: visible; }
        .lp-part svg path { stroke-linecap: round; stroke-linejoin: round; }
        .lp-m { stroke: ${INK}; stroke-width: 1.4; stroke-opacity: 0.82; transition: stroke-opacity .4s ease; }
        .lp-h { stroke: ${INK}; stroke-width: 1.1; stroke-opacity: 0.85; transition: stroke-opacity .4s ease; }
        .lp-d { stroke: ${GRAY}; stroke-width: 0.7; stroke-opacity: 0.6; transition: stroke-opacity .4s ease; }
        .lp-part:hover::before { opacity: 1; }
        .lp-part:hover .lp-m, .lp-part:hover .lp-h { stroke-opacity: 1; }
        .lp-part:hover .lp-d { stroke-opacity: 0.9; }
        .lp-trail { fill: none; stroke: ${GRAY}; stroke-width: 1; stroke-opacity: 0.6; stroke-dasharray: 1.5 6; }
        .lp-trail.is-red { stroke: ${RED}; stroke-opacity: 0.9; }
        .lp-cap {
          margin: 8px 0 0; text-align: center;
          font-size: 10.5px; font-weight: 600; line-height: 1.4; letter-spacing: 0.2em; text-transform: uppercase;
          color: #A8A29E; transition: color .4s ease;
        }
        .lp-cap b { font-weight: 700; color: ${GRAY}; transition: color .4s ease; }
        .lp-part:hover .lp-cap { color: ${INK}; }
        .lp-part:hover .lp-cap b { color: ${RED}; }

        /* 그리기 → 그 뒤 은은한 루프 */
        .lp-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: lp-draw var(--dur) cubic-bezier(.4,.1,.3,1) var(--s) forwards; }
        @keyframes lp-draw { to { stroke-dashoffset: 0; } }
        .lp-trail { opacity: 0; animation: lp-fade .8s ease var(--s) forwards, lp-march 9s linear var(--s) infinite; }
        @keyframes lp-fade { to { opacity: 1; } }
        @keyframes lp-march { to { stroke-dashoffset: -60; } }
        .lp-steam { fill: none; stroke: ${RED}; stroke-width: 1.1; opacity: 0; transform-box: fill-box; transform-origin: center bottom;
          animation: lp-steam 2.7s ease-in-out var(--s) infinite; }
        @keyframes lp-steam {
          0% { opacity: 0; transform: translateY(6px) scaleY(.9); }
          35% { opacity: .85; }
          100% { opacity: 0; transform: translateY(-10px) scaleY(1.05); }
        }
        .lp-seal { opacity: 0; transform-box: fill-box; transform-origin: center; animation: lp-stamp .45s cubic-bezier(.2,1.4,.4,1) var(--s) forwards; }
        @keyframes lp-stamp { 0% { opacity: 0; scale: 1.6; } 100% { opacity: .95; scale: 1; } }
        .lp-pin { opacity: 0; transform-box: fill-box; transform-origin: center bottom;
          animation: lp-fade .4s ease var(--s) forwards, lp-bob 3s ease-in-out calc(var(--s) + .4s) infinite; }
        @keyframes lp-bob { 0%, 100% { translate: 0 0; } 50% { translate: 0 -3px; } }
        @media (prefers-reduced-motion: reduce) {
          .lp-draw { animation: none; stroke-dashoffset: 0; }
          .lp-trail, .lp-seal, .lp-pin { animation: none; opacity: 1; }
          .lp-steam { animation: none; opacity: .7; }
        }

        /* 태블릿 이하: 여백만 줄인다 */
        @media (max-width: 1023px) { .lp-inner { padding: 20px 16px 18px; } }
        /* 폰: 파트별 가로 슬라이드 — 다음 파트가 살짝 보이게 */
        @media (max-width: 767px) {
          .lp-inner { padding: 16px 0 14px; }
          .lp-track {
            grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: 78%;
            overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding: 0 16px; padding: 0 16px;
            scrollbar-width: none; overscroll-behavior-x: contain;
          }
          .lp-track::-webkit-scrollbar { display: none; }
          .lp-part { scroll-snap-align: start; }
          .lp-cap { font-size: 10px; }
        }
      `}</style>
      <div className="lp-inner">
        <div className="lp-track">
          {PARTS.map((p, idx) => {
            const base = idx * PART_GAP
            return (
              <figure key={p.no} className="lp-part">
                <svg viewBox="0 0 400 236" role="img" aria-label={p.aria} focusable="false">
                  <path className={`lp-trail${idx === 2 ? ' is-red' : ''}`} d={TRAILS[idx]} vectorEffect="non-scaling-stroke" style={at(base + 0.6)} />
                  {strokes(p.lines, base)}
                  {p.extra(base)}
                </svg>
                <figcaption className="lp-cap"><b>{p.no}</b> · {p.label}</figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
