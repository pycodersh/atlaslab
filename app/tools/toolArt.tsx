import type { ReactNode } from 'react'
import type { ToolId } from './toolList'

const art = (children: ReactNode) => (
  <svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none">{children}</svg>
)

/**
 * 도구 일러스트 단일 출처 — 홈 대표 카드와 /tools 허브가 함께 쓴다.
 * 허브의 작은 4:3 썸네일은 가운데 200 폭만 보이므로 주인공 도형은 x 60~260 안에 둔다.
 * background 는 일러스트 뒤에 깔 그라데이션이다.
 */
export const TOOL_ART: Record<ToolId, { background: string; art: ReactNode }> = {
  'size-units': {
    background: 'linear-gradient(135deg, #14B8A6, #059669)',
    art: art(<>
      <path d="M128 24 88 44l12 28 18-9v48h84V63l18 9 12-28-40-20c-6 12-16 18-32 18s-26-6-32-18z" fill="#fff" />
      <rect x="66" y="118" width="188" height="22" rx="4" fill="#FDE68A" />
      <path d="M84 118v10M102 118v7M120 118v10M138 118v7M156 118v10M174 118v7M192 118v10M210 118v7M228 118v10" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
    </>),
  },
  'holiday-calendar': {
    background: 'linear-gradient(135deg, #F43F5E, #DC2626)',
    art: art(<>
      <rect x="112" y="24" width="96" height="108" rx="14" fill="#fff" />
      <path d="M112 38a14 14 0 0 1 14-14h68a14 14 0 0 1 14 14v12h-96z" fill="#FECDD3" />
      <g stroke="#9F1239" strokeWidth="6" strokeLinecap="round"><path d="M136 16v18M184 16v18" /></g>
      <circle cx="160" cy="91" r="29" fill="#27509B" />
      <path d="M131 91a29 29 0 0 1 58 0 14.500 14.500 0 0 1-29 0 14.500 14.500 0 0 0-29 0z" fill="#CD2E3A" />
    </>),
  },
  'kpop-calendar': {
    background: 'linear-gradient(135deg, #4C1D95, #DB2777)',
    art: art(<>
      <path d="M160 18 60 150h60zM160 18l40 132h60z" fill="#fff" opacity=".14" />
      <rect x="118" y="14" width="84" height="12" rx="6" fill="#fff" opacity=".85" />
      <g fill="#fff"><circle cx="58" cy="44" r="2.5" /><circle cx="262" cy="36" r="2" /><circle cx="286" cy="70" r="2.5" /><circle cx="34" cy="78" r="2" /></g>
      <g stroke="#fff" strokeWidth="5" strokeLinecap="round"><path d="M92 150v-34M160 150v-46M228 150v-34" /></g>
      <g fill="#FDE68A"><circle cx="92" cy="104" r="13" /><circle cx="160" cy="90" r="15" /><circle cx="228" cy="104" r="13" /></g>
    </>),
  },
  'transit-guide': {
    background: 'linear-gradient(135deg, #0E7490, #2563EB)',
    art: art(<>
      <path d="M-10 128C70 88 110 142 170 104s90-42 160-40" stroke="#fff" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" opacity=".8" />
      <circle cx="40" cy="106" r="7" fill="#fff" /><circle cx="286" cy="66" r="7" fill="#FDE68A" />
      <rect x="122" y="30" width="76" height="86" rx="18" fill="#fff" />
      <rect x="134" y="44" width="52" height="30" rx="6" fill="#1D4ED8" />
      <circle cx="142" cy="96" r="6" fill="#F59E0B" /><circle cx="178" cy="96" r="6" fill="#F59E0B" />
      <path d="M138 116l-10 18M182 116l10 18" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </>),
  },
  'order-builder': {
    background: 'linear-gradient(135deg, #F97316, #F59E0B)',
    art: art(<>
      <g stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".75"><path d="M136 52c-8-10 8-16 0-28M162 52c-8-10 8-16 0-28M188 52c-8-10 8-16 0-28" /></g>
      <path d="M92 70h136a68 62 0 0 1-136 0Z" fill="#fff" />
      <rect x="82" y="60" width="156" height="14" rx="7" fill="#FEF3C7" />
      <circle cx="160" cy="98" r="11" fill="#DC2626" opacity=".85" />
      <path d="m238 24-50 44M256 34l-58 38" stroke="#7C2D12" strokeWidth="5" strokeLinecap="round" />
    </>),
  },
  // 스톱워치의 노란 부채꼴이 재입장 무료 시간 15분(시계의 1/4)이다
  'subway-timer': {
    background: 'linear-gradient(135deg, #10B981, #14B8A6)',
    art: art(<>
      <path d="M72 62h30M62 86h30M76 110h24" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".7" />
      <rect x="148" y="12" width="24" height="12" rx="6" fill="#FDE68A" />
      <path d="M160 24v12" stroke="#fff" strokeWidth="8" />
      <circle cx="160" cy="88" r="54" fill="#fff" />
      <path d="M160 88V48a40 40 0 0 1 40 40Z" fill="#FDE68A" />
      <path d="M160 88V54" stroke="#047857" strokeWidth="5" strokeLinecap="round" />
      <circle cx="160" cy="88" r="7" fill="#047857" />
      <g fill="#fff"><circle cx="244" cy="50" r="2.5" /><circle cx="256" cy="104" r="2" /></g>
    </>),
  },
  'krw-converter': {
    background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
    art: art(<>
      <rect x="84" y="36" width="152" height="84" rx="10" fill="#fff" opacity=".28" transform="rotate(-9 160 78)" />
      <rect x="84" y="42" width="152" height="84" rx="10" fill="#fff" />
      <circle cx="104" cy="84" r="5" fill="#BFDBFE" /><circle cx="216" cy="84" r="5" fill="#BFDBFE" />
      <circle cx="160" cy="84" r="30" fill="#FDE68A" />
      <path d="m145 70 7 28 8-22 8 22 7-28M141 80h38M141 89h38" stroke="#3730A3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </>),
  },
  weather: {
    background: 'linear-gradient(135deg, #0369A1, #38BDF8)',
    art: art(<>
      <g stroke="#FDE68A" strokeWidth="5" strokeLinecap="round"><path d="M118 14v10M78 54h10M90 26l7 7M146 26l-7 7M90 82l7-7" /></g>
      <circle cx="118" cy="54" r="24" fill="#FDE68A" />
      <g fill="#fff"><circle cx="146" cy="92" r="24" /><circle cx="186" cy="78" r="32" /><circle cx="222" cy="96" r="20" /><rect x="124" y="90" width="118" height="26" rx="13" /></g>
      <g stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".8"><path d="m152 126-4 12M184 126l-4 12M216 126l-4 12" /></g>
    </>),
  },
  // 왼쪽 반은 낮, 오른쪽 반은 밤 — 서울과 고향의 시차
  'world-time': {
    background: 'linear-gradient(135deg, #1E1B4B, #6366F1)',
    art: art(<>
      <path d="M160 22a53 53 0 0 0 0 106Z" fill="#FDE68A" />
      <path d="M160 22a53 53 0 0 1 0 106Z" fill="#fff" />
      <g stroke="#4338CA" strokeWidth="3" opacity=".6"><path d="M160 22v106M107 75h106" /><ellipse cx="160" cy="75" rx="24" ry="53" /></g>
      <path d="M248 22a15 15 0 1 0 12 25 13 13 0 0 1-12-25Z" fill="#FDE68A" />
      <g fill="#fff"><circle cx="72" cy="40" r="2.5" /><circle cx="90" cy="112" r="2" /><circle cx="238" cy="104" r="2.5" /><circle cx="64" cy="84" r="2" /></g>
    </>),
  },
  // 지도 위 핀 하나와 도보 코스 지점 — 도구가 3곳 묶음을 보여 준다
  'hotspot-finder': {
    background: 'linear-gradient(135deg, #BE185D, #FB7185)',
    art: art(<>
      <path d="m76 112 56-18 56 18 56-18v34l-56 18-56-18-56 18Z" fill="#fff" opacity=".3" />
      <path d="M92 124c22-14 46 12 68 4s42-16 60-22" stroke="#fff" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      <circle cx="92" cy="124" r="7" fill="#FDE68A" /><circle cx="220" cy="106" r="7" fill="#FDE68A" />
      <path d="M160 12c-25 0-44 19-44 43 0 32 44 70 44 70s44-38 44-70c0-24-19-43-44-43Z" fill="#fff" />
      <circle cx="160" cy="55" r="16" fill="#BE185D" />
    </>),
  },
}
