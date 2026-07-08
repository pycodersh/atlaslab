'use client'

import { useState } from 'react'
import { X, Search, Eye, EyeOff, ChevronDown, RefreshCw, Plus, ArrowLeft, Home, BookOpen, PenLine, BarChart2, BookMarked, User, FileText, Bookmark, Layers, SearchX, WifiOff } from 'lucide-react'

const BURGUNDY = '#B44A5A'

// ── Layout helpers ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 60 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 20px', borderBottom: '1px solid var(--pd)', paddingBottom: 8 }}>
        {title}
      </p>
      {children}
    </section>
  )
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 12px' }}>{title}</p>
      {children}
    </div>
  )
}

// ── Static Dialog Card (no portal, always visible) ────────────────────────────

function DialogCard({
  tag, title, description, hint, actions = [], children,
}: {
  tag?: string; title?: string; description?: string; hint?: React.ReactNode;
  actions?: Array<{ label: string; variant?: string }>; children?: React.ReactNode;
}) {
  return (
    <div>
      {tag && <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 8px' }}>{tag}</p>}
      <div style={{
        background: 'var(--pglass)', backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        border: '1px solid var(--pglass-border)', borderRadius: 28, boxShadow: '0 8px 48px rgba(0,0,0,0.12)', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '22px 20px 0' }}>
          {title
            ? <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.25 }}>{title}</p>
            : <div />}
          <div style={{ background: 'rgba(120,120,128,0.10)', borderRadius: 999, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 8 }}>
            <X style={{ width: 12, height: 12, color: 'var(--pm)' }} strokeWidth={2.2} />
          </div>
        </div>
        {description && <p style={{ fontSize: 13.5, color: 'var(--pm)', margin: '10px 20px 0', lineHeight: 1.6 }}>{description}</p>}
        {hint && <div style={{ margin: '14px 20px 0', padding: '10px 13px', borderRadius: 12, background: 'rgba(88,86,214,0.08)', border: '1px solid rgba(88,86,214,0.15)' }}>{hint}</div>}
        {children && <div style={{ padding: '0 20px' }}>{children}</div>}
        {actions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: actions.length === 2 ? 'row' : 'column', gap: actions.length === 2 ? 8 : 10, padding: '20px 20px 22px' }}>
            {actions.map((a, i) => {
              const v = a.variant ?? 'primary'
              const s: React.CSSProperties =
                v === 'primary'  ? { background: 'var(--pt)', color: 'var(--pb)', border: 'none' }
                : v === 'danger' ? { background: 'none', color: BURGUNDY, border: '1px solid rgba(180,74,90,0.20)' }
                : v === 'text'   ? { background: 'none', color: 'var(--pm)', border: 'none' }
                : { background: 'var(--pglass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--pglass-border)', color: 'var(--pm)' }
              return (
                <button key={i} type="button" style={{ flex: 1, padding: '13px 0', borderRadius: 14, fontSize: 14, fontWeight: v === 'secondary' ? 500 : 700, fontFamily: 'inherit', cursor: 'default', minWidth: 0, ...s }}>
                  {a.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function ToastDemo() {
  const [active, setActive] = useState<string | null>(null)
  const labels = ['Saved', 'Deleted', 'Copied', 'Review Complete', 'Network Error', 'Offline']
  function show(msg: string) { setActive(msg); setTimeout(() => setActive(null), 2200) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {labels.map(t => (
          <button key={t} type="button" onClick={() => show(t)}
            style={{ padding: '8px 16px', borderRadius: 20, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--pt)', fontFamily: 'inherit' }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {labels.map(t => (
          <div key={t} style={{ background: 'var(--pt)', color: 'var(--pb)', fontSize: 12, padding: '8px 18px', borderRadius: 999, fontWeight: 600, whiteSpace: 'nowrap' }}>{t}</div>
        ))}
      </div>
      {active && (
        <div style={{ position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)', background: 'var(--pt)', color: 'var(--pb)', fontSize: 13, padding: '11px 24px', borderRadius: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.18)', zIndex: 99999, whiteSpace: 'nowrap', fontWeight: 600, letterSpacing: '0.02em' }}>
          {active}
        </div>
      )}
    </div>
  )
}

// ── Buttons ───────────────────────────────────────────────────────────────────

function Btn({ label, variant = 'primary', disabled = false, loading = false, iconOnly = false }: { label?: string; variant?: string; disabled?: boolean; loading?: boolean; iconOnly?: boolean }) {
  const s: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--pt)', color: 'var(--pb)', border: 'none' },
    secondary: { background: 'var(--pglass)', color: 'var(--pm)', border: '1px solid var(--pglass-border)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
    danger:    { background: 'none', color: BURGUNDY, border: '1px solid rgba(180,74,90,0.22)' },
    text:      { background: 'none', color: 'var(--pm)', border: 'none' },
  }
  return (
    <button type="button" disabled={disabled}
      style={{ padding: iconOnly ? '13px' : '13px 20px', borderRadius: 14, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: variant === 'secondary' ? 500 : 700, fontFamily: 'inherit', opacity: disabled ? 0.45 : 1, minWidth: iconOnly ? 48 : 96, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, ...(s[variant] ?? s.primary) }}>
      {loading ? <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : iconOnly ? <Plus size={16} /> : label}
    </button>
  )
}

// ── Inputs ────────────────────────────────────────────────────────────────────

const IBASE: React.CSSProperties = {
  width: '100%', padding: '13px 16px', borderRadius: 14, fontSize: 14, fontFamily: 'inherit',
  background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid var(--pglass-border)', color: 'var(--pt)', outline: 'none', boxSizing: 'border-box',
}

function InputsDemo() {
  const [showPw, setShowPw] = useState(false)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
      <div>
        <Sub title="Search">
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--pm)' }} strokeWidth={2} />
            <input type="search" placeholder="Search patterns…" style={{ ...IBASE, paddingLeft: 38 }} readOnly />
          </div>
        </Sub>
        <Sub title="Text Input">
          <input type="text" placeholder="Enter your name…" style={IBASE} readOnly />
        </Sub>
        <Sub title="Email">
          <input type="email" placeholder="you@example.com" style={IBASE} readOnly />
        </Sub>
      </div>
      <div>
        <Sub title="Password">
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} placeholder="Password" defaultValue="mysecret" style={{ ...IBASE, paddingRight: 44 }} readOnly />
            <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pm)', padding: 4 }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Sub>
        <Sub title="Dropdown">
          <div style={{ position: 'relative' }}>
            <select style={{ ...IBASE, appearance: 'none', paddingRight: 40 }}>
              <option>English</option><option>Korean</option><option>Japanese</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--pm)', pointerEvents: 'none' }} strokeWidth={2} />
          </div>
        </Sub>
        <Sub title="Textarea">
          <textarea placeholder="Write your essay…" rows={4} style={{ ...IBASE, resize: 'vertical', lineHeight: 1.6 }} readOnly />
        </Sub>
      </div>
      <div>
        <Sub title="Filter Chips">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', 'New', 'Review', 'Mastered'].map((f, i) => (
              <button key={f} type="button" style={{ padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'default', background: i === 0 ? 'var(--pt)' : 'var(--pglass)', color: i === 0 ? 'var(--pb)' : 'var(--pm)', border: i === 0 ? 'none' : '1px solid var(--pglass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                {f}
              </button>
            ))}
          </div>
        </Sub>
      </div>
    </div>
  )
}

// ── Cards ─────────────────────────────────────────────────────────────────────

const GC: React.CSSProperties = {
  background: 'var(--pglass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid var(--pglass-border)', borderRadius: 20, padding: '16px 18px',
}

function CardsDemo() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
      {/* Essay */}
      <div>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 8px' }}>Essay Card</p>
        <div style={GC}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 3px' }}>ESSAY · STORY 01</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: 0 }}>A New Start</p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pa)', background: 'rgba(109,141,255,0.10)', borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>Draft</span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--pm)', lineHeight: 1.6, margin: '0 0 10px' }}>I decided to make a fresh start this Monday…</p>
          <p style={{ fontSize: 11, color: 'var(--pm2)', margin: 0 }}>124 words · July 8</p>
        </div>
      </div>
      {/* Story */}
      <div>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 8px' }}>Story Card</p>
        <div style={{ ...GC, padding: 0, overflow: 'hidden' }}>
          <div style={{ height: 72, background: 'linear-gradient(135deg, rgba(109,141,255,0.25) 0%, rgba(180,180,255,0.12) 100%)' }} />
          <div style={{ padding: '12px 16px 16px' }}>
            <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 3px' }}>STORY 01</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: '0 0 3px' }}>A New Start</p>
            <p style={{ fontSize: 12, color: 'var(--pm)', margin: '0 0 10px' }}>새로운 한 주의 시작</p>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#2A7A3A', background: 'rgba(42,122,58,0.10)', borderRadius: 20, padding: '2px 10px' }}>5 patterns</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pa)', background: 'rgba(109,141,255,0.10)', borderRadius: 20, padding: '2px 10px' }}>In progress</span>
            </div>
          </div>
        </div>
      </div>
      {/* Library */}
      <div>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 8px' }}>Library Card</p>
        <div style={GC}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(109,141,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookMarked size={16} style={{ color: 'var(--pa)' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: 0 }}>decide to</p>
              <p style={{ fontSize: 11, color: 'var(--pm2)', margin: 0 }}>~하기로 결심하다</p>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--pm)', lineHeight: 1.5, margin: 0 }}>I decided to take a different approach this time.</p>
        </div>
      </div>
      {/* Progress */}
      <div>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 8px' }}>Progress Card</p>
        <div style={GC}>
          <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 12px' }}>THIS WEEK</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {[{ n: '12', l: 'Reviews' }, { n: '3', l: 'Stories' }, { n: '72%', l: 'Score' }].map(({ n, l }) => (
              <div key={l}>
                <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--pt)', margin: 0, letterSpacing: '-0.03em' }}>{n}</p>
                <p style={{ fontSize: 11, color: 'var(--pm2)', margin: 0 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Subscription */}
      <div>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 8px' }}>Subscription Card</p>
        <div style={{ ...GC, background: 'linear-gradient(135deg, rgba(109,141,255,0.15) 0%, rgba(155,109,255,0.08) 100%)', border: '1px solid rgba(109,141,255,0.22)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pa)', margin: '0 0 3px' }}>PREMIUM</p>
              <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em' }}>₩9,900 / month</p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: 'var(--pa)', borderRadius: 20, padding: '4px 12px', alignSelf: 'flex-start' }}>Active</span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--pm)', lineHeight: 1.5, margin: 0 }}>Unlimited reviews · All patterns · Priority support</p>
        </div>
      </div>
      {/* Review */}
      <div>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 8px' }}>Review Card</p>
        <div style={GC}>
          <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 8px' }}>PATTERN</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--pt)', margin: '0 0 14px', letterSpacing: '-0.01em' }}>I decided to ___</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: '1px solid rgba(180,74,90,0.22)', background: 'none', color: BURGUNDY, fontSize: 13, fontWeight: 700, cursor: 'default', fontFamily: 'inherit' }}>Again</button>
            <button type="button" style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', background: 'var(--pa)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'default', fontFamily: 'inherit' }}>Got it</button>
          </div>
        </div>
      </div>
      {/* Profile */}
      <div>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 8px' }}>Profile Card</p>
        <div style={{ ...GC, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--pa) 0%, rgba(155,109,255,0.8) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={22} style={{ color: '#fff' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: '0 0 2px' }}>John Doe</p>
            <p style={{ fontSize: 12, color: 'var(--pm)', margin: 0 }}>john@example.com</p>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pa)', background: 'rgba(109,141,255,0.10)', borderRadius: 20, padding: '3px 10px' }}>Premium</span>
        </div>
      </div>
    </div>
  )
}

// ── Empty States ──────────────────────────────────────────────────────────────

function EmptyStatesDemo() {
  const states = [
    { Icon: PenLine,   title: 'No Essays Yet',    desc: 'Write your first essay to start practicing.' },
    { Icon: BookOpen,  title: 'No Stories',        desc: 'Stories will appear here as you progress.' },
    { Icon: Bookmark,  title: 'No Saved Words',    desc: 'Tap any word while reading to save it.' },
    { Icon: Layers,    title: 'No Patterns',       desc: 'Complete a story to unlock patterns.' },
    { Icon: SearchX,   title: 'No Search Results', desc: 'Try a different search term.' },
    { Icon: WifiOff,   title: 'No Connection',     desc: 'Check your internet connection and try again.' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
      {states.map(({ Icon, title, desc }) => (
        <div key={title} style={{ background: 'var(--pglass)', border: '1px solid var(--pglass-border)', borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 16px', gap: 10 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(109,141,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={22} style={{ color: 'var(--pa)' }} strokeWidth={1.6} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: 0 }}>{title}</p>
          <p style={{ fontSize: 12.5, color: 'var(--pm)', margin: 0, lineHeight: 1.55 }}>{desc}</p>
        </div>
      ))}
    </div>
  )
}

// ── Navigation ────────────────────────────────────────────────────────────────

function NavigationDemo() {
  const tabs = [
    { Icon: Home, label: 'HOME' }, { Icon: BookOpen, label: 'STORY' },
    { Icon: PenLine, label: 'ESSAYS' }, { Icon: BarChart2, label: 'PROGRESS' },
    { Icon: BookMarked, label: 'LIBRARY' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 440 }}>
      <Sub title="Top Navigation">
        <div style={{ background: 'var(--pglass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--pglass-border)', borderRadius: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" style={{ background: 'none', border: 'none', cursor: 'default', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--pa)', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
            <ArrowLeft size={16} strokeWidth={2.5} /> Back
          </button>
          <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--pt)', margin: 0, letterSpacing: '-0.01em' }}>Page Title</p>
          <div style={{ width: 60 }} />
        </div>
      </Sub>
      <Sub title="Bottom Navigation">
        <div style={{ background: 'var(--pglass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--pglass-border)', borderRadius: 20, padding: '12px 8px', display: 'flex', justifyContent: 'space-around' }}>
          {tabs.map(({ Icon, label }, i) => {
            const active = i === 0
            return (
              <button key={label} type="button" style={{ background: 'none', border: 'none', cursor: 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 10px', minWidth: 44 }}>
                <Icon size={22} style={{ color: active ? 'var(--pa)' : 'var(--pm)', strokeWidth: active ? 2 : 1.6 }} />
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, letterSpacing: '0.08em', color: active ? 'var(--pa)' : 'var(--pm2)', textTransform: 'uppercase' }}>{label}</span>
              </button>
            )
          })}
        </div>
      </Sub>
      <Sub title="Back Button">
        <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', borderRadius: 20, padding: '9px 16px 9px 12px', cursor: 'default', color: 'var(--pt)', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <ArrowLeft size={16} strokeWidth={2.5} /> Back
        </button>
      </Sub>
      <Sub title="Floating Action Button">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button type="button" style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--pa)', border: 'none', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(109,141,255,0.4)' }}>
            <Plus size={24} style={{ color: '#fff' }} strokeWidth={2.5} />
          </button>
          <button type="button" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--pglass)', border: '1px solid var(--pglass-border)', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
            <Plus size={20} style={{ color: 'var(--pa)' }} strokeWidth={2.5} />
          </button>
        </div>
      </Sub>
    </div>
  )
}

// ── Token helpers ─────────────────────────────────────────────────────────────

function Swatch({ label, color, hex }: { label: string; color: string; hex?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: color, flexShrink: 0, border: '1px solid rgba(128,128,128,0.12)' }} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pt)' }}>{label}</div>
        {hex && <div style={{ fontSize: 10, color: 'var(--pm)', fontFamily: 'monospace' }}>{hex}</div>}
      </div>
    </div>
  )
}

function ShadowRow({ label, shadow }: { label: string; shadow: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 52, height: 40, borderRadius: 12, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', boxShadow: shadow, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pt)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--pm)', fontFamily: 'monospace' }}>{shadow}</div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function UIPlaygroundClient() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)', padding: '28px 20px 100px', maxWidth: 760, margin: '0 auto', boxSizing: 'border-box' }}>

      <div style={{ marginBottom: 52 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 6px' }}>PATTO · DEV ONLY</p>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--pt)', margin: '0 0 8px', letterSpacing: '-0.03em' }}>UI Design System</h1>
        <p style={{ fontSize: 13, color: 'var(--pm)', margin: 0, lineHeight: 1.6 }}>Component catalog — Design Source of Truth. All dialogs shown always-open. Reference before adding any new UI. → <a href="/dev/screens" style={{ color: 'var(--pa)', textDecoration: 'none', fontWeight: 600 }}>/dev/screens</a> · <a href="/dev/theme" style={{ color: 'var(--pa)', textDecoration: 'none', fontWeight: 600 }}>/dev/theme</a></p>
      </div>

      {/* 1. Dialogs */}
      <Section title="Dialogs — Always Open">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>

          <DialogCard tag="Login · Social"
            title="Continue with Account"
            description="Sign in to save your progress and sync across devices."
            actions={[{ label: 'Sign in with Apple', variant: 'primary' }, { label: 'Sign in with Google', variant: 'secondary' }]}
          />

          <DialogCard tag="Delete Essay · Danger"
            title="Delete Essay?"
            description="This action cannot be undone."
            actions={[{ label: 'Cancel', variant: 'secondary' }, { label: 'Delete', variant: 'danger' }]}
          />

          <DialogCard tag="Delete Account · Danger"
            title="Delete your account?"
            description="This action cannot be undone. All data will be permanently removed."
            actions={[{ label: 'Cancel', variant: 'secondary' }, { label: 'Delete', variant: 'danger' }]}
          />

          <DialogCard tag="Sign Out · Confirm"
            title="Sign out?"
            actions={[{ label: 'Cancel', variant: 'secondary' }, { label: 'Sign out', variant: 'danger' }]}
          />

          <DialogCard tag="Android Install · Primary"
            title="Add PATTO to Home Screen"
            description="Install PATTO for faster access and continue learning like an app."
            actions={[{ label: 'Not now', variant: 'secondary' }, { label: 'Install', variant: 'primary' }]}
          />

          <DialogCard tag="iPhone Install · Guide"
            title="Install PATTO on iPhone"
            hint={<p style={{ fontSize: 12.5, color: '#5856D6', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>Open this page in Safari to add it to your Home Screen.</p>}
            actions={[{ label: 'Got it', variant: 'text' }]}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 14, paddingBottom: 4 }}>
              {['Tap the Share button (□↑) at the bottom of Safari.', 'Select "Add to Home Screen" from the menu.', 'Tap "Add" in the top right to finish.'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 13.5, color: 'var(--pt)', flexShrink: 0, lineHeight: 1.55 }}>{i + 1}.</span>
                  <p style={{ fontSize: 13.5, color: 'var(--pt)', margin: 0, lineHeight: 1.55 }}>{s}</p>
                </div>
              ))}
            </div>
          </DialogCard>

          <DialogCard tag="Review Complete · Action"
            title="Review completed."
            actions={[{ label: 'View Result', variant: 'primary' }]}
          />

          <DialogCard tag="Network Error · Error"
            title="Network Error"
            description="Please check your connection and try again."
            actions={[{ label: 'Cancel', variant: 'secondary' }, { label: 'Retry', variant: 'primary' }]}
          />

          <DialogCard tag="Review Mastery · Info"
            title="Review Mastery"
            description="How mastery levels work"
            actions={[{ label: 'OK', variant: 'text' }]}
          >
            <div style={{ paddingTop: 4 }}>
              <div style={{ height: 1, background: 'var(--pd)', marginBottom: 12 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[{ step: 'New', color: '#C87A3A', desc: 'Seen for the first time.' }, { step: 'Learning', color: '#C8913A', desc: 'Building familiarity.' }, { step: 'Review', color: '#7A6AC8', desc: 'Consolidating memory.' }, { step: 'Mastered', color: '#2A7A3A', desc: 'Long-term retention achieved.' }].map(({ step, color, desc }) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}12`, border: `1px solid ${color}28`, borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>{step}</span>
                    <span style={{ fontSize: 11, color: 'var(--pm)', lineHeight: 1.55 }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </DialogCard>

          <DialogCard tag="Score Info · Info"
            title="Score Information"
            description="Current Score: 72%"
            actions={[{ label: 'OK', variant: 'text' }]}
          >
            <div style={{ paddingTop: 4 }}>
              <div style={{ height: 1, background: 'var(--pd)', marginBottom: 12 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[{ range: '0 – 19', label: 'Getting Started', color: '#C87A3A' }, { range: '20 – 39', label: 'Building Up', color: '#C8913A' }, { range: '40 – 59', label: 'Good', color: '#7A6AC8' }, { range: '60 – 79', label: 'Very Good', color: '#4A7AC8' }, { range: '80+', label: 'Excellent', color: '#2A7A3A' }].map(({ range, label, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--pm)', width: 46, flexShrink: 0 }}>{range}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}12`, border: `1px solid ${color}28`, borderRadius: 6, padding: '2px 8px' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </DialogCard>

          <DialogCard tag="Mastery Info · Info"
            title="Review Mastery"
            description="How mastery levels work"
            actions={[{ label: 'OK', variant: 'text' }]}
          >
            <div style={{ paddingTop: 4 }}>
              <div style={{ height: 1, background: 'var(--pd)', marginBottom: 12 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[{ step: 'New', color: '#C87A3A', desc: 'First time seeing this pattern.' }, { step: 'Learning', color: '#C8913A', desc: 'Building familiarity through repetition.' }, { step: 'Review', color: '#7A6AC8', desc: 'Consolidating memory over time.' }, { step: 'Mastered', color: '#2A7A3A', desc: 'Long-term retention achieved.' }].map(({ step, color, desc }) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}12`, border: `1px solid ${color}28`, borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>{step}</span>
                    <span style={{ fontSize: 11, color: 'var(--pm)', lineHeight: 1.55 }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </DialogCard>

          <DialogCard tag="Subscription · Upgrade"
            title="Upgrade to Premium"
            description="Unlock unlimited reviews, all patterns, and advanced features."
            actions={[{ label: 'Maybe later', variant: 'text' }, { label: 'Subscribe', variant: 'primary' }]}
          />

          <DialogCard tag="Discard Draft · 3-option"
            title="Discard draft?"
            description="저장하지 않으면 이 글은 사라집니다."
            actions={[{ label: 'Save Draft', variant: 'secondary' }, { label: 'Discard', variant: 'danger' }, { label: 'Cancel', variant: 'text' }]}
          />

        </div>
      </Section>

      {/* 2. Toast */}
      <Section title="Toast">
        <ToastDemo />
      </Section>

      {/* 3. Buttons */}
      <Section title="Buttons">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { label: 'Primary',   btns: [{ t: 'Install', v: 'primary' }, { t: 'Save', v: 'primary' }, { t: 'Continue', v: 'primary' }] },
            { label: 'Secondary', btns: [{ t: 'Cancel', v: 'secondary' }, { t: 'Not now', v: 'secondary' }] },
            { label: 'Danger',    btns: [{ t: 'Delete', v: 'danger' }, { t: 'Sign out', v: 'danger' }] },
            { label: 'Text',      btns: [{ t: 'Got it', v: 'text' }, { t: 'OK', v: 'text' }, { t: 'Maybe later', v: 'text' }] },
            { label: 'Disabled',  btns: [{ t: 'Save', v: 'primary', d: true }, { t: 'Cancel', v: 'secondary', d: true }] },
          ].map(g => (
            <Sub key={g.label} title={g.label}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {g.btns.map((b, i) => <Btn key={i} label={b.t} variant={b.v} disabled={'d' in b} />)}
              </div>
            </Sub>
          ))}
          <Sub title="Loading"><Btn loading variant="primary" /></Sub>
          <Sub title="Icon Button (FAB)">
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn iconOnly variant="primary" /><Btn iconOnly variant="secondary" />
            </div>
          </Sub>
        </div>
      </Section>

      {/* 4. Typography */}
      <Section title="Typography">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { name: 'Display',      size: 32, weight: 900, ls: '-0.03em', sample: 'PATTO' },
            { name: 'Page Title',   size: 24, weight: 800, ls: '-0.025em', sample: 'Your Progress' },
            { name: 'Section Title',size: 20, weight: 800, ls: '-0.02em', sample: 'This Week' },
            { name: 'Card Title',   size: 17, weight: 700, ls: '-0.01em', sample: 'A New Start' },
            { name: 'Body',         size: 15, weight: 400, ls: '0', sample: 'The quick brown fox jumps over the lazy dog.' },
            { name: 'Caption',      size: 12.5, weight: 400, ls: '0', sample: 'Story 01 · July 8' },
            { name: 'Label',        size: 10, weight: 700, ls: '0.14em', sample: 'SECTION HEADER', upper: true },
            { name: 'Button',       size: 14, weight: 700, ls: '0', sample: 'Save Draft' },
            { name: 'Micro Text',   size: 9,  weight: 700, ls: '0.22em', sample: 'PATTO · DEV ONLY', upper: true },
          ].map(t => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--pm2)', letterSpacing: '0.10em', textTransform: 'uppercase', width: 88, flexShrink: 0 }}>{t.name}</span>
              <span style={{ fontSize: t.size, fontWeight: t.weight, color: 'var(--pt)', letterSpacing: t.ls, lineHeight: 1.25, textTransform: t.upper ? 'uppercase' : undefined }}>{t.sample}</span>
              <span style={{ fontSize: 9.5, color: 'var(--pm2)', fontFamily: 'monospace', alignSelf: 'center' }}>{t.size}/{t.weight}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Input */}
      <Section title="Input">
        <InputsDemo />
      </Section>

      {/* 6. Card */}
      <Section title="Card">
        <CardsDemo />
      </Section>

      {/* 7. Empty State */}
      <Section title="Empty State">
        <EmptyStatesDemo />
      </Section>

      {/* 8. Navigation */}
      <Section title="Navigation">
        <NavigationDemo />
      </Section>

      {/* 9. Tokens */}
      <Section title="Tokens">
        <Sub title="Colors">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { label: 'Accent  --pa',        color: 'var(--pa)',    hex: '#6D8DFF / #8FABFF' },
              { label: 'Danger',               color: BURGUNDY,       hex: '#B44A5A' },
              { label: 'Success',              color: '#34C759',      hex: '#34C759' },
              { label: 'Warning',              color: '#FF9500',      hex: '#FF9500' },
              { label: 'Text  --pt',           color: 'var(--pt)',    hex: '#1C1C1E / #F2F2F5' },
              { label: 'Body  --pt2',          color: 'var(--pt2)',   hex: '#3A3A3C / #E0E0EA' },
              { label: 'Secondary  --pm',      color: 'var(--pm)',    hex: '#6E6E73 / #9090AA' },
              { label: 'Caption  --pm2',       color: 'var(--pm2)',   hex: '#8E8E93 / #5A5A72' },
              { label: 'Glass  --pglass',      color: 'var(--pglass)' },
              { label: 'Background  --pb',     color: 'var(--pb)' },
              { label: 'Divider  --pd',        color: 'var(--pd)' },
              { label: 'Accent Light  --pal',  color: 'var(--pal)' },
            ].map(s => <Swatch key={s.label} {...s} />)}
          </div>
        </Sub>

        <Sub title="Spacing">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end' }}>
            {[4, 8, 12, 16, 20, 24, 28, 32, 40, 48].map(s => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ width: s, height: s, background: 'var(--pa)', borderRadius: 3, opacity: 0.65 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--pm)' }}>{s}</span>
              </div>
            ))}
          </div>
        </Sub>

        <Sub title="Border Radius">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
            {[8, 10, 12, 14, 16, 20, 24, 28, 32, 999].map(r => (
              <div key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 48, height: 48, background: 'var(--pa)', borderRadius: r, opacity: 0.65 }} />
                <span style={{ fontSize: 10, color: 'var(--pm)' }}>{r === 999 ? '∞' : r}</span>
              </div>
            ))}
          </div>
        </Sub>

        <Sub title="Shadow">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'None',   shadow: 'none' },
              { label: 'XS',     shadow: '0 1px 4px rgba(0,0,0,0.08)' },
              { label: 'SM',     shadow: '0 2px 12px rgba(0,0,0,0.10)' },
              { label: 'MD',     shadow: '0 4px 20px rgba(0,0,0,0.12)' },
              { label: 'LG',     shadow: '0 8px 40px rgba(0,0,0,0.14)' },
              { label: 'Dialog', shadow: '0 8px 48px rgba(0,0,0,0.16)' },
              { label: 'FAB',    shadow: '0 4px 20px rgba(109,141,255,0.40)' },
            ].map(s => <ShadowRow key={s.label} {...s} />)}
          </div>
        </Sub>

        <Sub title="Glass">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Nav / Card',   blur: 'blur(24px) saturate(180%)' },
              { label: 'Dialog',       blur: 'blur(32px) saturate(180%)' },
              { label: 'Subtle',       blur: 'blur(16px) saturate(160%)' },
            ].map(g => (
              <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 64, height: 40, borderRadius: 12, background: 'var(--pglass)', backdropFilter: g.blur, WebkitBackdropFilter: g.blur, border: '1px solid var(--pglass-border)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pt)' }}>{g.label}</div>
                  <code style={{ fontSize: 10, color: 'var(--pm)' }}>{g.blur}</code>
                </div>
              </div>
            ))}
          </div>
        </Sub>

        <Sub title="Border">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Glass border  --pglass-border', border: '1px solid var(--pglass-border)' },
              { label: 'Divider  --pd',                 border: '1px solid var(--pd)' },
              { label: 'Accent border  --pacb',          border: '1px solid var(--pacb)' },
              { label: 'Danger border',                  border: '1px solid rgba(180,74,90,0.22)' },
            ].map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 64, height: 36, borderRadius: 10, background: 'var(--pglass)', border: b.border, flexShrink: 0 }} />
                <code style={{ fontSize: 11, color: 'var(--pm)' }}>{b.label}</code>
              </div>
            ))}
          </div>
        </Sub>

        <Sub title="Animation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Dialog open',  val: '220ms cubic-bezier(0.34,1.56,0.64,1)' },
              { label: 'Toast fade',   val: '200ms ease' },
              { label: 'Button hover', val: '150ms ease' },
              { label: 'Tab switch',   val: '250ms cubic-bezier(0.25,0.1,0.25,1)' },
              { label: 'Swipe row',    val: '220ms cubic-bezier(0.25,0.1,0.25,1)' },
            ].map(a => (
              <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--pt)', width: 96, flexShrink: 0 }}>{a.label}</span>
                <code style={{ fontSize: 11, color: 'var(--pm)', background: 'var(--pglass)', border: '1px solid var(--pglass-border)', borderRadius: 6, padding: '3px 8px' }}>{a.val}</code>
              </div>
            ))}
          </div>
        </Sub>

        <Sub title="Icon Size">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end' }}>
            {[12, 14, 16, 18, 20, 22, 24, 28, 32].map(s => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <BookOpen size={s} style={{ color: 'var(--pa)' }} strokeWidth={2} />
                <span style={{ fontSize: 10, color: 'var(--pm)' }}>{s}</span>
              </div>
            ))}
          </div>
        </Sub>
      </Section>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input::placeholder, textarea::placeholder { color: var(--pm2) }
        select { color: var(--pt) }
      `}</style>
    </div>
  )
}
