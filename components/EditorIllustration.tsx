'use client'

import type { IllustrationType } from '@/data/editor-notes'

// ── CSS Animation keyframes (injected once) ───────────────────────────────────
const STYLE = `
@keyframes ei-breathe {
  0%,100% { opacity:.85; transform:scale(1); }
  50%      { opacity:1;   transform:scale(1.04); }
}
@keyframes ei-steam {
  0%   { transform:translateY(0)   scaleX(1);   opacity:.6; }
  50%  { transform:translateY(-8px) scaleX(1.2); opacity:.35; }
  100% { transform:translateY(-16px) scaleX(.8); opacity:0; }
}
@keyframes ei-steam2 {
  0%   { transform:translateY(0)   scaleX(1);   opacity:.45; }
  50%  { transform:translateY(-10px) scaleX(.9); opacity:.25; }
  100% { transform:translateY(-20px) scaleX(1.1); opacity:0; }
}
@keyframes ei-flutter {
  0%,100% { transform:rotate(0deg); }
  25%     { transform:rotate(.5deg) translateY(-1px); }
  75%     { transform:rotate(-.5deg) translateY(1px); }
}
@keyframes ei-pulse {
  0%,100% { transform:scale(1); }
  50%     { transform:scale(1.06); }
}
@keyframes ei-wave {
  0%,100% { d:path("M0,10 Q20,0 40,10 Q60,20 80,10 Q100,0 120,10"); }
  50%     { d:path("M0,10 Q20,20 40,10 Q60,0 80,10 Q100,20 120,10"); }
}
@keyframes ei-blink {
  0%,90%,100% { transform:scaleY(1); }
  95%         { transform:scaleY(.05); }
}
@keytml ei-tick {
  0%,49% { transform:rotate(0deg); }
  50%,100%{ transform:rotate(6deg); }
}
@keyframes ei-float {
  0%,100% { transform:translateY(0); }
  50%     { transform:translateY(-4px); }
}
@keyframes ei-draw {
  from { stroke-dashoffset:200; }
  to   { stroke-dashoffset:0; }
}
@keyframes ei-fadein {
  from { opacity:0; transform:translateY(6px); }
  to   { opacity:1; transform:translateY(0); }
}
`

let injected = false
function injectStyle() {
  if (injected || typeof document === 'undefined') return
  injected = true
  const el = document.createElement('style')
  el.textContent = STYLE
  document.head.appendChild(el)
}

// ── Shared palette (PATTO warm ivory) ────────────────────────────────────────
const C = {
  accent: 'var(--pa)',
  warm:   '#C8956A',
  paper:  'var(--pc)',
  border: 'var(--pd)',
  text:   'var(--pt)',
  muted:  'var(--pm)',
}

// ── Individual illustrations ──────────────────────────────────────────────────

function Lightbulb() {
  return (
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
      style={{ animation:'ei-fadein .8s ease-out both' }}>
      {/* glow */}
      <ellipse cx="60" cy="58" rx="36" ry="36"
        fill="rgba(255,200,80,.12)"
        style={{ animation:'ei-breathe 3s ease-in-out infinite' }} />
      {/* bulb glass */}
      <path d="M42,60 C42,42 52,28 60,28 C68,28 78,42 78,60 C78,72 72,80 68,86 L52,86 C48,80 42,72 42,60 Z"
        fill="rgba(255,220,100,.18)" stroke={C.warm} strokeWidth="1.8" />
      {/* filament */}
      <path d="M52,86 L52,78 Q60,70 68,78 L68,86"
        fill="none" stroke={C.warm} strokeWidth="1.6" strokeLinecap="round" />
      {/* base bands */}
      <rect x="52" y="86" width="16" height="5" rx="1" fill={C.border} />
      <rect x="53" y="93" width="14" height="5" rx="1" fill={C.border} />
      <rect x="55" y="100" width="10" height="4" rx="1" fill={C.muted} opacity=".5" />
      {/* gleam */}
      <circle cx="52" cy="44" r="3" fill="white" opacity=".4"
        style={{ animation:'ei-breathe 2.5s ease-in-out infinite' }} />
    </svg>
  )
}

function Coffee() {
  return (
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
      style={{ animation:'ei-fadein .8s ease-out both' }}>
      {/* saucer */}
      <ellipse cx="60" cy="108" rx="34" ry="6" fill={C.border} />
      {/* cup body */}
      <path d="M38,80 L44,108 L76,108 L82,80 Z"
        fill={C.paper} stroke={C.border} strokeWidth="1.5" />
      {/* cup top ellipse */}
      <ellipse cx="60" cy="80" rx="22" ry="5" fill="none" stroke={C.border} strokeWidth="1.5" />
      {/* coffee surface */}
      <ellipse cx="60" cy="80" rx="20" ry="4" fill={C.warm} opacity=".35" />
      {/* handle */}
      <path d="M82,86 Q94,86 94,94 Q94,102 82,102"
        fill="none" stroke={C.border} strokeWidth="2" strokeLinecap="round" />
      {/* steam 1 */}
      <path d="M52,76 Q50,68 52,60" fill="none" stroke={C.muted} strokeWidth="1.5"
        strokeLinecap="round" opacity=".7"
        style={{ animation:'ei-steam 2.4s ease-in-out infinite' }} />
      {/* steam 2 */}
      <path d="M60,74 Q58,64 60,54" fill="none" stroke={C.muted} strokeWidth="1.5"
        strokeLinecap="round" opacity=".55"
        style={{ animation:'ei-steam2 2.4s ease-in-out infinite .6s' }} />
      {/* steam 3 */}
      <path d="M68,76 Q70,66 68,58" fill="none" stroke={C.muted} strokeWidth="1.5"
        strokeLinecap="round" opacity=".7"
        style={{ animation:'ei-steam 2.4s ease-in-out infinite 1.2s' }} />
    </svg>
  )
}

function Book() {
  return (
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
      style={{ animation:'ei-fadein .8s ease-out both' }}>
      <g style={{ animation:'ei-flutter 4s ease-in-out infinite', transformOrigin:'60px 80px' }}>
        {/* spine */}
        <rect x="56" y="38" width="8" height="80" rx="2" fill={C.warm} />
        {/* left cover */}
        <path d="M56,38 L24,44 L24,118 L56,118 Z"
          fill={C.paper} stroke={C.border} strokeWidth="1.2" />
        {/* right cover */}
        <path d="M64,38 L96,44 L96,118 L64,118 Z"
          fill={C.paper} stroke={C.border} strokeWidth="1.2" />
        {/* left page lines */}
        <line x1="30" y1="58" x2="54" y2="57" stroke={C.border} strokeWidth="1" />
        <line x1="30" y1="64" x2="54" y2="63" stroke={C.border} strokeWidth="1" />
        <line x1="30" y1="70" x2="54" y2="69" stroke={C.border} strokeWidth="1" />
        <line x1="30" y1="76" x2="50" y2="75" stroke={C.border} strokeWidth="1" />
        {/* right page lines */}
        <line x1="66" y1="57" x2="90" y2="58" stroke={C.border} strokeWidth="1" />
        <line x1="66" y1="63" x2="90" y2="64" stroke={C.border} strokeWidth="1" />
        <line x1="66" y1="69" x2="90" y2="70" stroke={C.border} strokeWidth="1" />
        <line x1="66" y1="75" x2="86" y2="76" stroke={C.border} strokeWidth="1" />
      </g>
    </svg>
  )
}

function Brain() {
  return (
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
      style={{ animation:'ei-fadein .8s ease-out both' }}>
      <g style={{ animation:'ei-pulse 3.5s ease-in-out infinite', transformOrigin:'60px 72px' }}>
        {/* brain outline — simplified editorial shape */}
        <path d="
          M60,32
          C44,32 34,42 34,54
          C34,60 36,64 40,68
          C36,70 32,74 32,80
          C32,90 40,98 50,98
          C52,104 56,108 60,108
          C64,108 68,104 70,98
          C80,98 88,90 88,80
          C88,74 84,70 80,68
          C84,64 86,60 86,54
          C86,42 76,32 60,32 Z
        " fill="none" stroke={C.accent} strokeWidth="2" opacity=".7" />
        {/* left lobe wrinkle */}
        <path d="M38,56 C42,52 46,58 42,64" fill="none" stroke={C.accent} strokeWidth="1.3" opacity=".5" />
        <path d="M36,72 C40,70 42,76 38,80" fill="none" stroke={C.accent} strokeWidth="1.3" opacity=".5" />
        {/* right lobe wrinkle */}
        <path d="M82,56 C78,52 74,58 78,64" fill="none" stroke={C.accent} strokeWidth="1.3" opacity=".5" />
        <path d="M84,72 C80,70 78,76 82,80" fill="none" stroke={C.accent} strokeWidth="1.3" opacity=".5" />
        {/* center divide */}
        <line x1="60" y1="36" x2="60" y2="104" stroke={C.border} strokeWidth="1" strokeDasharray="3,3" />
      </g>
      {/* neural sparks */}
      {[{x:46,y:58},{x:74,y:62},{x:52,y:80},{x:68,y:78}].map((p,i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={C.accent} opacity=".5"
          style={{ animation:`ei-breathe ${1.8+i*.4}s ease-in-out infinite ${i*.3}s` }} />
      ))}
    </svg>
  )
}

function Pattern() {
  return (
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
      style={{ animation:'ei-fadein .8s ease-out both' }}>
      {/* grid of dots — editorial pattern feel */}
      {Array.from({length:5}, (_,row) =>
        Array.from({length:5}, (_,col) => {
          const x = 28 + col * 16
          const y = 42 + row * 16
          const delay = (row + col) * 0.1
          return (
            <circle key={`${row}-${col}`} cx={x} cy={y} r="3"
              fill={C.accent} opacity=".25"
              style={{ animation:`ei-breathe 2s ease-in-out infinite ${delay}s` }} />
          )
        })
      )}
      {/* accent lines forming a phrase bracket */}
      <rect x="26" y="105" width="68" height="18" rx="6"
        fill="none" stroke={C.accent} strokeWidth="1.5" opacity=".4" />
      <text x="60" y="118" textAnchor="middle"
        fontSize="8" fill={C.accent} opacity=".6" fontFamily="serif" fontStyle="italic">
        pattern
      </text>
    </svg>
  )
}

function Speech() {
  return (
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
      style={{ animation:'ei-fadein .8s ease-out both' }}>
      {/* bubble 1 — large */}
      <rect x="22" y="30" width="70" height="42" rx="14"
        fill={C.paper} stroke={C.border} strokeWidth="1.5"
        style={{ animation:'ei-float 3.5s ease-in-out infinite' }} />
      <path d="M36,72 L30,84 L46,72" fill={C.paper} stroke={C.border} strokeWidth="1.5"
        strokeLinejoin="round"
        style={{ animation:'ei-float 3.5s ease-in-out infinite' }} />
      {/* lines in bubble 1 */}
      <line x1="32" y1="46" x2="82" y2="46" stroke={C.border} strokeWidth="1.2" />
      <line x1="32" y1="54" x2="70" y2="54" stroke={C.border} strokeWidth="1.2" />
      {/* bubble 2 — small */}
      <rect x="38" y="88" width="56" height="30" rx="10"
        fill={C.paper} stroke={C.border} strokeWidth="1.5"
        style={{ animation:'ei-float 3.5s ease-in-out infinite .8s' }} />
      <path d="M80,88 L86,76 L72,88" fill={C.paper} stroke={C.border} strokeWidth="1.5"
        strokeLinejoin="round"
        style={{ animation:'ei-float 3.5s ease-in-out infinite .8s' }} />
      <line x1="48" y1="100" x2="84" y2="100" stroke={C.border} strokeWidth="1.2" />
      <line x1="48" y1="108" x2="74" y2="108" stroke={C.border} strokeWidth="1.2" />
    </svg>
  )
}

function Pen() {
  return (
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
      style={{ animation:'ei-fadein .8s ease-out both' }}>
      {/* paper */}
      <rect x="28" y="36" width="64" height="82" rx="4"
        fill={C.paper} stroke={C.border} strokeWidth="1.5"
        style={{ animation:'ei-flutter 5s ease-in-out infinite' }} />
      {/* ruled lines */}
      {[54,64,74,84,94,104].map((y,i) => (
        <line key={y} x1="36" x2={i < 4 ? 84 : 70} y1={y} y2={y}
          stroke={C.border} strokeWidth="1" />
      ))}
      {/* written accent line */}
      <line x1="36" y1="54" x2="76" y2="54" stroke={C.accent} strokeWidth="1.4"
        strokeDasharray="200" strokeDashoffset="0"
        style={{ animation:'ei-draw 1.5s ease-out .3s both' }} />
      {/* pen */}
      <g style={{ animation:'ei-float 3s ease-in-out infinite', transformOrigin:'84px 54px' }}>
        <path d="M72,36 L88,52 L84,56 L76,48 Z" fill={C.warm} />
        <path d="M76,48 L84,56 L80,60 L70,50 Z" fill={C.warm} opacity=".7" />
        <path d="M80,60 L76,64 L72,68 L74,62 Z" fill={C.muted} />
        <line x1="74" y1="62" x2="72" y2="68" stroke={C.accent} strokeWidth="1" />
      </g>
    </svg>
  )
}

function Wave() {
  return (
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
      style={{ animation:'ei-fadein .8s ease-out both' }}>
      {/* sound waves — 3 layers */}
      {[
        { d:'M20,70 Q35,50 50,70 Q65,90 80,70 Q95,50 110,70', op:.25, delay:'0s' },
        { d:'M20,70 Q35,48 50,70 Q65,92 80,70 Q95,48 110,70', op:.45, delay:'.2s' },
        { d:'M20,70 Q35,46 50,70 Q65,94 80,70 Q95,46 110,70', op:.7, delay:'.4s' },
      ].map((w,i) => (
        <path key={i} d={w.d} fill="none" stroke={C.accent} strokeWidth={1.5+i*.4}
          opacity={w.op}
          style={{ animation:`ei-float 2.5s ease-in-out infinite ${w.delay}` }} />
      ))}
      {/* center dot */}
      <circle cx="60" cy="70" r="4" fill={C.accent} opacity=".7"
        style={{ animation:'ei-pulse 2s ease-in-out infinite' }} />
      {/* small label */}
      <text x="60" y="115" textAnchor="middle" fontSize="8"
        fill={C.muted} fontFamily="serif" fontStyle="italic">spoken</text>
    </svg>
  )
}

function Eye() {
  return (
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
      style={{ animation:'ei-fadein .8s ease-out both' }}>
      <g style={{ animation:'ei-blink 5s ease-in-out infinite', transformOrigin:'60px 70px' }}>
        {/* eye outline */}
        <path d="M20,70 Q60,30 100,70 Q60,110 20,70 Z"
          fill="none" stroke={C.border} strokeWidth="1.8" />
        {/* iris */}
        <circle cx="60" cy="70" r="18" fill="none" stroke={C.accent} strokeWidth="1.5" opacity=".6" />
        {/* pupil */}
        <circle cx="60" cy="70" r="9" fill={C.accent} opacity=".25" />
        <circle cx="60" cy="70" r="4" fill={C.accent} opacity=".6" />
        {/* highlight */}
        <circle cx="55" cy="65" r="2.5" fill="white" opacity=".7" />
      </g>
      {/* lashes */}
      {[-28,-14,0,14,28].map((dx,i) => (
        <line key={i} x1={60+dx} y1={40+Math.abs(dx)*.25} x2={60+dx} y2={34+Math.abs(dx)*.25}
          stroke={C.border} strokeWidth="1.2" />
      ))}
    </svg>
  )
}

function Clock() {
  return (
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
      style={{ animation:'ei-fadein .8s ease-out both' }}>
      {/* face */}
      <circle cx="60" cy="70" r="36" fill={C.paper} stroke={C.border} strokeWidth="2" />
      {/* hour ticks */}
      {Array.from({length:12},(_,i) => {
        const a = (i/12)*Math.PI*2 - Math.PI/2
        const r1=30, r2=34
        return <line key={i}
          x1={60+r1*Math.cos(a)} y1={70+r1*Math.sin(a)}
          x2={60+r2*Math.cos(a)} y2={70+r2*Math.sin(a)}
          stroke={C.border} strokeWidth="1.5" />
      })}
      {/* hour hand */}
      <line x1="60" y1="70" x2="60" y2="50"
        stroke={C.text} strokeWidth="2.5" strokeLinecap="round"
        style={{ transformOrigin:'60px 70px', animation:'ei-float 6s linear infinite' }} />
      {/* minute hand */}
      <line x1="60" y1="70" x2="82" y2="70"
        stroke={C.text} strokeWidth="1.8" strokeLinecap="round" />
      {/* center */}
      <circle cx="60" cy="70" r="3" fill={C.accent} />
    </svg>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
const ILLUS: Record<IllustrationType, () => JSX.Element> = {
  lightbulb: Lightbulb,
  coffee:    Coffee,
  book:      Book,
  brain:     Brain,
  pattern:   Pattern,
  speech:    Speech,
  pen:       Pen,
  wave:      Wave,
  eye:       Eye,
  clock:     Clock,
}

export function EditorIllustration({ type }: { type: IllustrationType }) {
  if (typeof document !== 'undefined') injectStyle()
  const Comp = ILLUS[type] ?? Lightbulb
  return (
    <div style={{ width: '100%', maxWidth: 200, margin: '0 auto', aspectRatio: '6/7' }}>
      <Comp />
    </div>
  )
}
