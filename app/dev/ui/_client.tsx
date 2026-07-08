'use client'

import { useState } from 'react'
import { X, Search, Eye, EyeOff, ChevronDown, RefreshCw, Plus, ArrowLeft, Home, BookOpen, PenLine, BarChart2, BookMarked, User, FileText, Bookmark, Layers, SearchX, WifiOff, ChevronRight, CheckCircle2, Circle, PlayCircle, Lock, Loader2, Mail } from 'lucide-react'

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
              const v = a.variant ?? 'confirm'
              const GLASS_BTN: React.CSSProperties = { background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }
              const s: React.CSSProperties =
                v === 'confirm' ? { ...GLASS_BTN, border: '1px solid var(--pd)', color: 'var(--pt)' }
                : v === 'cancel'  ? { ...GLASS_BTN, border: '1px solid var(--pd)', color: 'var(--pm)' }
                : v === 'danger'  ? { ...GLASS_BTN, color: BURGUNDY, border: '1px solid rgba(180,74,90,0.28)' }
                : v === 'accent'  ? { ...GLASS_BTN, border: '1px solid rgba(109,141,255,0.30)', color: 'var(--pa)' }
                : { ...GLASS_BTN, border: '1px solid var(--pd)', color: 'var(--pm)' }
              return (
                <button key={i} type="button" style={{ flex: 1, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16, fontSize: 14, fontWeight: v === 'cancel' ? 500 : 700, fontFamily: 'inherit', cursor: 'default', minWidth: 0, ...s }}>
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
    secondary: { background: 'var(--pglass)', color: 'var(--pm)', border: '1px solid rgba(0,0,0,0.12)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
    danger:    { background: 'none', color: BURGUNDY, border: '1px solid rgba(180,74,90,0.22)' },
    text:      { background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', color: 'var(--pm)', border: '1px solid var(--pglass-border)' },
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

          {/* Login / Social — AccountPopup. Apple 제거. Google/Email/Kakao 동일 glass style. */}
          <div style={{ background: 'var(--pglass)', backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)', border: '1px solid var(--pglass-border)', borderRadius: 28, boxShadow: '0 8px 48px rgba(0,0,0,0.16)', overflow: 'hidden' }}>
            <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pm2)', padding: '14px 20px 0', margin: 0 }}>Login · Social — Google(white) / Email(white) / Kakao(#FEE500)</p>
            <div style={{ padding: '14px 20px 20px' }}>
              <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--pt)', margin: '0 0 6px' }}>Welcome to PATTO</p>
              <p style={{ fontSize: 13, color: 'var(--pm)', lineHeight: 1.6, margin: '0 0 18px' }}>Sign in to save your essays and continue learning across devices.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                {/* Google — white bg + gray border + official icon + dark text */}
                <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', height: 52, padding: '0 18px', borderRadius: 16, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.12)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', fontSize: 14, fontWeight: 600, color: '#1F1F1F', fontFamily: 'inherit', cursor: 'default', boxSizing: 'border-box' }}>
                  <svg viewBox="0 0 24 24" width={20} height={20} style={{ flexShrink: 0 }}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span style={{ flex: 1, textAlign: 'center', marginRight: 20 }}>Continue with Google</span>
                </button>
                {/* Email — white bg + gray border + dark icon + dark text */}
                <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', height: 52, padding: '0 18px', borderRadius: 16, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.12)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', fontSize: 14, fontWeight: 600, color: '#1F1F1F', fontFamily: 'inherit', cursor: 'default', boxSizing: 'border-box' }}>
                  <svg viewBox="0 0 24 24" width={20} height={20} style={{ flexShrink: 0 }} fill="none" stroke="#1F1F1F" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 7 10-7"/></svg>
                  <span style={{ flex: 1, textAlign: 'center', marginRight: 20 }}>Continue with Email</span>
                </button>
                {/* Kakao — brand yellow bg + dark icon + dark text */}
                <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', height: 52, padding: '0 18px', borderRadius: 16, background: '#FEE500', border: '1px solid rgba(0,0,0,0.06)', fontSize: 14, fontWeight: 600, color: '#1A1A1A', fontFamily: 'inherit', cursor: 'default', boxSizing: 'border-box' }}>
                  <svg viewBox="0 0 24 24" width={20} height={20} style={{ flexShrink: 0 }} fill="none"><path d="M12 5.5C8.13 5.5 5 7.97 5 11.03c0 1.93 1.2 3.63 3.01 4.67l-.77 2.87c-.07.26.22.47.45.33L11.1 17c.29.03.59.05.9.05 3.87 0 7-2.47 7-5.52S15.87 5.5 12 5.5z" fill="#3C1E1E"/></svg>
                  <span style={{ flex: 1, textAlign: 'center', marginRight: 20 }}>카카오로 계속하기</span>
                </button>
              </div>
              <p style={{ fontSize: 10, color: 'var(--pm2)', textAlign: 'center', margin: 0 }}>Terms of Use · Privacy Policy</p>
            </div>
          </div>

          <DialogCard tag="Delete Essay · Danger"
            title="Delete Essay?"
            description="This action cannot be undone."
            actions={[{ label: 'Cancel', variant: 'cancel' }, { label: 'Delete', variant: 'danger' }]}
          />

          <DialogCard tag="Delete Account · Danger"
            title="Delete your account?"
            description="This action cannot be undone. All data will be permanently removed."
            actions={[{ label: 'Cancel', variant: 'cancel' }, { label: 'Delete', variant: 'danger' }]}
          />

          <DialogCard tag="Sign Out · Danger"
            title="Sign out?"
            actions={[{ label: 'Cancel', variant: 'cancel' }, { label: 'Sign out', variant: 'danger' }]}
          />

          <DialogCard tag="Android Install · Accent"
            title="Add PATTO to Home Screen"
            description="Install PATTO for faster access and continue learning like an app."
            actions={[{ label: 'Not now', variant: 'cancel' }, { label: 'Install', variant: 'accent' }]}
          />

          <DialogCard tag="iPhone Install · Guide"
            title="Install PATTO on iPhone"
            hint={<p style={{ fontSize: 12.5, color: '#5856D6', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>Open this page in Safari to add it to your Home Screen.</p>}
            actions={[{ label: 'Got it', variant: 'confirm' }]}
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

          <DialogCard tag="Review Complete · Accent"
            title="Review completed."
            actions={[{ label: 'View Result', variant: 'accent' }]}
          />

          <DialogCard tag="Network Error · Error"
            title="Network Error"
            description="Please check your connection and try again."
            actions={[{ label: 'Cancel', variant: 'cancel' }, { label: 'Retry', variant: 'accent' }]}
          />

          <DialogCard tag="Review Mastery · Info"
            title="Review Mastery"
            description="How mastery levels work"
            actions={[{ label: 'OK', variant: 'confirm' }]}
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
            actions={[{ label: 'OK', variant: 'confirm' }]}
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
            actions={[{ label: 'OK', variant: 'confirm' }]}
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
            actions={[{ label: 'Maybe later', variant: 'cancel' }, { label: 'Subscribe', variant: 'accent' }]}
          />

          <DialogCard tag="Discard Draft · 3-option"
            title="Discard draft?"
            description="저장하지 않으면 이 글은 사라집니다."
            actions={[{ label: 'Save Draft', variant: 'cancel' }, { label: 'Discard', variant: 'danger' }, { label: 'Cancel', variant: 'cancel' }]}
          />

          {/* SwipeDeleteRow confirm — component: SwipeDeleteRow.tsx */}
          <DialogCard tag="Swipe Delete · Confirm"
            title="Delete this?"
            description="This action cannot be undone."
            actions={[{ label: 'Cancel', variant: 'cancel' }, { label: 'Delete', variant: 'danger' }]}
          />

        </div>
      </Section>

      {/* 2. Mission Popup */}
      <Section title="Mission Popup — TodayMissionPopup">
        <p style={{ fontSize: 12, color: 'var(--pm)', marginBottom: 20, lineHeight: 1.6 }}>
          홈 최초 접속 시 표시. localStorage의 오늘 날짜 체크 후 1회만 노출. 미션이 모두 완료된 날은 표시 안 함.
        </p>
        <div style={{ maxWidth: 360 }}>
          {/* TodayMissionPopup 실물 재현 */}
          <div style={{ background: 'var(--pglass)', backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)', border: '1px solid var(--pglass-border)', borderRadius: 28, boxShadow: '0 8px 48px rgba(0,0,0,0.16)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0' }}>
              <p style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--pt)', margin: 0 }}>Today&apos;s Mission</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'var(--pglass)', border: '1px solid var(--pglass-border)' }}>
                <X size={13} style={{ color: 'var(--pm)' }} strokeWidth={2} />
              </div>
            </div>
            <div style={{ padding: '18px 20px 20px' }}>
              {/* LEARN TODAY */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', textTransform: 'uppercase', margin: '0 0 7px' }}>LEARN TODAY</p>
                {[{ id: '03', title: 'BUILDING UP' }, { id: '04', title: 'MOVING ON' }].map(s => (
                  <div key={s.id} style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--pt)', letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Story {s.id} ·</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--pt)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{s.title}</span>
                  </div>
                ))}
              </div>
              {/* REVIEW */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', textTransform: 'uppercase', margin: '0 0 7px' }}>REVIEW</p>
                {[{ id: '01', title: 'A NEW START' }, { id: '02', title: 'FIRST STEPS' }].map(s => (
                  <div key={s.id} style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--pt)', letterSpacing: '0.18em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Story {s.id} ·</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--pt)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{s.title}</span>
                  </div>
                ))}
              </div>
              {/* CTA glass button */}
              <button type="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', padding: '13px 0', background: 'var(--pglass)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'var(--pt)', fontFamily: 'inherit', cursor: 'default', letterSpacing: '0.03em' }}>
                Start Learning <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          {/* Review-only variant */}
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '20px 0 10px' }}>Review Only (no new stories)</p>
          <div style={{ background: 'var(--pglass)', backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)', border: '1px solid var(--pglass-border)', borderRadius: 28, boxShadow: '0 8px 48px rgba(0,0,0,0.16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0' }}>
              <p style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--pt)', margin: 0 }}>Today&apos;s Mission</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'var(--pglass)', border: '1px solid var(--pglass-border)' }}>
                <X size={13} style={{ color: 'var(--pm)' }} strokeWidth={2} />
              </div>
            </div>
            <div style={{ padding: '18px 20px 20px' }}>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--pm2)', textTransform: 'uppercase', margin: '0 0 7px' }}>REVIEW</p>
                <p style={{ fontSize: 13, color: 'var(--pm2)', margin: 0 }}>No review patterns due today.</p>
              </div>
              <button type="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', padding: '13px 0', background: 'var(--pglass)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'var(--pt)', fontFamily: 'inherit', cursor: 'default', letterSpacing: '0.03em' }}>
                Start Learning <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* 3. Bottom Sheet */}
      <Section title="Bottom Sheet">
        <Sub title="StoryJumpSheet — 학습 목록">
          <p style={{ fontSize: 12, color: 'var(--pm)', marginBottom: 16, lineHeight: 1.6 }}>StoryCardEngine 상단 목록 버튼 → 전체 스토리 점프 시트. rounded-t-3xl, max-h-75dvh, translate-y 애니메이션.</p>
          <div style={{ border: '1px solid var(--pd)', borderRadius: 24, overflow: 'hidden', maxWidth: 380 }}>
            {/* handle + header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 20px 12px' }}>
              <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--pd)', marginBottom: 16 }} />
              <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)' }}>학습 목록</span>
                <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pglass)', border: '1px solid var(--pd)' }}>
                  <X size={14} style={{ color: 'var(--pm2)' }} />
                </div>
              </div>
            </div>
            {/* legend */}
            <div style={{ display: 'flex', gap: 16, padding: '0 20px 10px', borderBottom: '1px solid var(--pd)' }}>
              {[{ Icon: CheckCircle2, color: '#22C55E', label: '완료' }, { Icon: PlayCircle, color: '#4F8CFF', label: '진행 중' }, { Icon: Circle, color: '#D1D9E6', label: '미학습' }].map(({ Icon, color, label }) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--pm2)' }}>
                  <Icon size={14} style={{ color }} />
                  {label}
                </span>
              ))}
            </div>
            {/* story list */}
            {[
              { n: 1, title: 'A New Start', status: 'done' as const },
              { n: 2, title: 'First Steps', status: 'done' as const },
              { n: 3, title: 'Building Up', status: 'active' as const },
              { n: 4, title: 'Moving On', status: 'idle' as const },
              { n: 5, title: 'New Horizons', status: 'idle' as const },
            ].map(({ n, title, status }) => {
              const colors = { done: { bg: '#DCFCE7', txt: '#22C55E', row: 'transparent', titleC: '#374151' }, active: { bg: '#4F8CFF', txt: '#fff', row: 'rgba(79,140,255,0.06)', titleC: '#4F8CFF' }, idle: { bg: '#F5F8FF', txt: '#B0BCCE', row: 'transparent', titleC: '#9EAEC8' } }
              const c = colors[status]
              return (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: c.row }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: c.txt }}>{n}</span>
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: c.titleC }}>{title}</span>
                  {status === 'done' && <CheckCircle2 size={16} style={{ color: '#22C55E' }} />}
                  {status === 'active' && <PlayCircle size={16} style={{ color: '#4F8CFF' }} />}
                </div>
              )
            })}
          </div>
        </Sub>

        <Sub title="DayDetailSheet — 날짜별 기록">
          <p style={{ fontSize: 12, color: 'var(--pm)', marginBottom: 16, lineHeight: 1.6 }}>Records 페이지 캘린더 날짜 탭 → 해당 날짜 학습 기록 시트.</p>
          <div style={{ border: '1px solid var(--pd)', borderRadius: 24, overflow: 'hidden', maxWidth: 380 }}>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid var(--pd)' }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 4px' }}>LEARNING RECORD</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--pt)', margin: 0 }}>July 8</p>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pglass)', border: '1px solid var(--pd)' }}>
                <X size={14} style={{ color: 'var(--pm2)' }} />
              </div>
            </div>
            {/* completed */}
            <div style={{ padding: '14px 20px 10px' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#22C55E', margin: '0 0 10px' }}>Completed</p>
              {['Story 01 · A New Start', 'Story 02 · First Steps'].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--pd)' }}>
                  <CheckCircle2 size={14} style={{ color: '#22C55E', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--pt)', fontWeight: 600 }}>{s}</span>
                </div>
              ))}
            </div>
            {/* due */}
            <div style={{ padding: '10px 20px 16px' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pa)', margin: '0 0 10px' }}>Due for Review</p>
              {['Story 01 · A New Start'].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                  <RefreshCw size={14} style={{ color: 'var(--pa)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--pt)', fontWeight: 600 }}>{s}</span>
                </div>
              ))}
            </div>
            {/* empty state */}
            <div style={{ padding: '10px 20px 16px', borderTop: '1px solid var(--pd)' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 8px' }}>Empty State</p>
              <p style={{ fontSize: 13, color: 'var(--pm2)', margin: 0 }}>이 날은 학습 기록이 없어요.</p>
            </div>
          </div>
        </Sub>
      </Section>

      {/* 4. Popover */}
      <Section title="Popover">
        <Sub title="GlobalSavePopup — Mode A (단어 + 추천 표현)">
          <p style={{ fontSize: 12, color: 'var(--pm)', marginBottom: 16, lineHeight: 1.6 }}>
            Story 본문에서 단어 탭 → chunk(표현)가 있을 때. popupStore 싱글톤으로 화면 중앙에 표시.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--pb)', border: '1px solid var(--pd)', borderRadius: 16, padding: '18px 20px 16px', boxShadow: '0 8px 40px rgba(0,0,0,0.25)', minWidth: 240, maxWidth: 300 }}>
              <p style={{ fontSize: 13, color: 'var(--pt2)', margin: '0 0 10px', textAlign: 'center' }}>&ldquo;decided&rdquo;</p>
              <div style={{ background: 'rgba(100,180,255,0.15)', border: '1px solid rgba(100,180,255,0.40)', borderRadius: 10, padding: '8px 12px', marginBottom: 14, textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: 'var(--pm)', margin: '0 0 3px', letterSpacing: '0.05em', fontWeight: 600 }}>추천 표현</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: 0 }}>decided to try</p>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button type="button" style={{ flex: 1, padding: '9px 14px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, background: 'var(--pglass)', color: 'var(--pt2)', fontFamily: 'inherit', cursor: 'default' }}>표현 저장</button>
                <button type="button" style={{ flex: 1, padding: '9px 14px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, background: 'rgba(200,205,215,0.5)', color: 'var(--pt)', fontFamily: 'inherit', cursor: 'default' }}>단어만</button>
              </div>
              <button type="button" style={{ width: '100%', padding: '9px 14px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, background: 'transparent', color: 'var(--pm)', fontFamily: 'inherit', cursor: 'default' }}>취소</button>
            </div>
          </div>
        </Sub>

        <Sub title="GlobalSavePopup — Mode B (단어만)">
          <div style={{ maxWidth: 260 }}>
            <div style={{ background: 'var(--pb)', border: '1px solid var(--pd)', borderRadius: 16, padding: '18px 20px 16px', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: '0 0 14px', textAlign: 'center' }}>&ldquo;perseverance&rdquo;</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" style={{ flex: 1, padding: '9px 14px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, background: 'var(--pglass)', color: 'var(--pt2)', fontFamily: 'inherit', cursor: 'default' }}>단어 저장</button>
                <button type="button" style={{ flex: 1, padding: '9px 14px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, background: 'var(--pglass)', color: 'var(--pt2)', fontFamily: 'inherit', cursor: 'default' }}>취소</button>
              </div>
            </div>
          </div>
        </Sub>

        <Sub title="WordSavePopup — 텍스트 선택 저장">
          <p style={{ fontSize: 12, color: 'var(--pm)', marginBottom: 16, lineHeight: 1.6 }}>
            Story 본문 long-press 텍스트 선택 → 선택 영역 바로 아래에 앵커링. 6단어 이하 선택 시에만 표시.
          </p>
          <div style={{ position: 'relative', maxWidth: 340, padding: '20px 20px 60px', background: 'var(--pglass)', border: '1px solid var(--pglass-border)', borderRadius: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--pt)', lineHeight: 1.7, margin: 0 }}>
              I decided to{' '}
              <span style={{ background: 'rgba(109,141,255,0.18)', borderRadius: 3 }}>try something new</span>
              {' '}this week, even though it felt difficult at first.
            </p>
            {/* popover anchored below selection */}
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'var(--pt)', borderRadius: 10, padding: '7px 4px', display: 'flex', gap: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.20)', whiteSpace: 'nowrap' }}>
              <button type="button" style={{ padding: '4px 14px', borderRadius: 8, background: 'transparent', border: 'none', fontSize: 13, fontWeight: 700, color: 'var(--pb)', fontFamily: 'inherit', cursor: 'default' }}>Save</button>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.2)', margin: '4px 0' }} />
              <button type="button" style={{ padding: '4px 14px', borderRadius: 8, background: 'transparent', border: 'none', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', fontFamily: 'inherit', cursor: 'default' }}>Cancel</button>
            </div>
          </div>
        </Sub>
      </Section>

      {/* 5. Full-Screen State */}
      <Section title="Full-Screen State">
        <Sub title="CompletionScreen — 모든 스토리 완료">
          <p style={{ fontSize: 12, color: 'var(--pm)', marginBottom: 16, lineHeight: 1.6 }}>
            StoryCardEngine 마지막 스토리 완료 → 전체 화면 교체. components/CompletionScreen.tsx
          </p>
          <div style={{ border: '1px solid var(--pd)', borderRadius: 20, padding: '48px 24px', textAlign: 'center', maxWidth: 360 }}>
            <p style={{ fontSize: 48, margin: '0 0 20px' }}>🎉</p>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--pt)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>모든 스토리 완료!</h2>
            <p style={{ fontSize: 14, color: 'var(--pm)', lineHeight: 1.7, margin: '0 0 28px' }}>Level 1의 모든 패턴을 학습했습니다.<br />복습을 통해 패턴을 확실히 익혀보세요.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 280, margin: '0 auto' }}>
              <button type="button" style={{ width: '100%', padding: '14px 0', borderRadius: 999, background: 'var(--pt)', color: 'var(--pb)', fontSize: 14, fontWeight: 700, border: 'none', fontFamily: 'inherit', cursor: 'default' }}>처음부터 다시 학습</button>
              <button type="button" style={{ width: '100%', padding: '14px 0', borderRadius: 999, background: 'transparent', color: 'var(--pt)', fontSize: 14, fontWeight: 600, border: '1px solid rgba(0,0,0,0.12)', fontFamily: 'inherit', cursor: 'default' }}>학습 기록 보기</button>
            </div>
          </div>
        </Sub>

        <Sub title="UpgradeWall — Premium Gate">
          <p style={{ fontSize: 12, color: 'var(--pm)', marginBottom: 16, lineHeight: 1.6 }}>
            무료 플랜 유저가 Story {'>'}  FREE_STORY_LIMIT 접근 시. components/StoryPageClient.tsx
          </p>
          <div style={{ border: '1px solid var(--pd)', borderRadius: 20, padding: '48px 24px', textAlign: 'center', maxWidth: 360 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(109,141,255,0.10)', border: '1px solid rgba(109,141,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={28} style={{ color: 'var(--pa)' }} />
            </div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pa)', margin: '0 0 8px' }}>PREMIUM STORY</p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--pt)', margin: '0 0 6px' }}>&ldquo;Moving On&rdquo;</h2>
            <p style={{ fontSize: 13, color: 'var(--pm)', lineHeight: 1.7, margin: '0 0 24px' }}>Free plan includes the first 3 stories.<br />Upgrade to unlock all stories.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 260, margin: '0 auto' }}>
              <button type="button" style={{ width: '100%', padding: '13px 0', borderRadius: 14, background: '#4A6FA8', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', fontFamily: 'inherit', cursor: 'default' }}>Upgrade to Premium</button>
              <button type="button" style={{ width: '100%', padding: '13px 0', borderRadius: 14, background: 'transparent', color: 'var(--pm)', fontSize: 13, fontWeight: 500, border: 'none', fontFamily: 'inherit', cursor: 'default' }}>← Go back</button>
            </div>
          </div>
        </Sub>

        <Sub title="Essay Loading — AI 리뷰 진행 중">
          <p style={{ fontSize: 12, color: 'var(--pm)', marginBottom: 16, lineHeight: 1.6 }}>에세이 제출 후 AI 리뷰 처리 중 상태. Submit 버튼이 disabled + Loader2 스피너로 교체.</p>
          <button type="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: 'var(--pt)', color: 'var(--pb)', fontSize: 14, fontWeight: 700, border: 'none', fontFamily: 'inherit', cursor: 'not-allowed', opacity: 0.75 }}>
            <Loader2 size={16} style={{ color: 'var(--pb)', animation: 'spin 1s linear infinite' }} />
            Reviewing…
          </button>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </Sub>
      </Section>

      {/* 6. Toast */}
      <Section title="Toast">
        <ToastDemo />
        <Sub title="All Variants">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340 }}>
            {[
              { msg: 'Essay saved.', bg: 'var(--pt)', color: 'var(--pb)' },
              { msg: 'Saved to Library', bg: 'var(--pglass)', color: 'var(--pt)', border: '1px solid var(--pd)' },
              { msg: '단어 저장됨', bg: 'var(--pglass)', color: 'var(--pt2)', border: '1px solid var(--pd)' },
              { msg: '표현 저장됨', bg: 'var(--pglass)', color: 'var(--pt2)', border: '1px solid var(--pd)' },
              { msg: 'Free plan: 10 words max · Upgrade to Premium', bg: '#3A3A3C', color: '#fff', maxW: 320 },
              { msg: 'Sign in coming soon.', bg: 'var(--pt)', color: 'var(--pb)' },
              { msg: '인증 기능 준비 중입니다.', bg: 'var(--pt)', color: 'var(--pb)' },
              { msg: 'Network Error. Check your connection.', bg: BURGUNDY, color: '#fff' },
            ].map(({ msg, bg, color, border, maxW }) => (
              <div key={msg} style={{ alignSelf: 'center', padding: '8px 22px', borderRadius: 20, background: bg, color, fontSize: 12, fontWeight: 600, border: border ?? 'none', maxWidth: maxW ?? 280, textAlign: 'center', lineHeight: 1.5 }}>{msg}</div>
            ))}
          </div>
        </Sub>
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

        {/* ── Colors ── */}
        <Sub title="Colors">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                token: '--pt', hex: '#1C1C1E / #F2F2F5', label: 'Primary Text',
                example: <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--pt)', margin: 0, letterSpacing: '-0.02em' }}>A New Start</p>,
                usage: 'Page title, Card title, Dialog title, Nav title',
              },
              {
                token: '--pm', hex: '#6E6E73 / #9090AA', label: 'Secondary Text',
                example: <p style={{ fontSize: 13, color: 'var(--pm)', margin: 0, lineHeight: 1.5 }}>I decided to try something new this week.</p>,
                usage: 'Description, Dialog body, Card subtitle, Empty state desc',
              },
              {
                token: '--pm2', hex: '#8E8E93 / #5A5A72', label: 'Caption / Label',
                example: <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: 0 }}>STORY 01 · JULY 8</p>,
                usage: 'Section headers, Timestamps, Nav labels (inactive), X button icon',
              },
              {
                token: '--pb', hex: '#FAFAFA / #0C0C14', label: 'Page Background',
                example: <div style={{ width: 80, height: 36, borderRadius: 10, background: 'var(--pb)', border: '1px solid var(--pd)' }} />,
                usage: 'Page background (html body), Primary button text color',
              },
              {
                token: '--pglass', hex: 'rgba(255,255,255,0.72) / rgba(26,26,42,0.80)', label: 'Glass Fill',
                example: (
                  <div style={{ padding: '8px 14px', borderRadius: 12, background: 'var(--pglass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--pglass-border)', fontSize: 13, fontWeight: 600, color: 'var(--pm)' }}>Cancel</div>
                ),
                usage: 'Card, Dialog, Bottom Nav, Secondary button, Back button',
              },
              {
                token: '--pd', hex: 'rgba(60,60,67,0.10) / rgba(255,255,255,0.10)', label: 'Divider',
                example: (
                  <div style={{ width: 200 }}>
                    <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--pt)' }}>Score Info</div>
                    <div style={{ height: 1, background: 'var(--pd)' }} />
                    <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--pt)' }}>Review Mastery</div>
                  </div>
                ),
                usage: 'Section dividers in dialogs/lists, Progress bar track',
              },
              {
                token: '--pa', hex: '#6D8DFF / #8FABFF', label: 'Accent',
                example: (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ height: 4, width: 32, background: 'var(--pa)', borderRadius: 2 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pa)', background: 'rgba(109,141,255,0.08)', borderRadius: 20, padding: '2px 10px' }}>In Progress</span>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--pa)' }} />
                  </div>
                ),
                usage: 'Active nav icon, Progress bar, Status chip, Accent underline, Icon fill',
              },
              {
                token: 'Danger', hex: '#B44A5A (fixed)', label: 'Danger',
                example: (
                  <button type="button" style={{ padding: '7px 16px', borderRadius: 12, background: 'none', border: '1px solid rgba(180,74,90,0.22)', color: BURGUNDY, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'default' }}>Delete</button>
                ),
                usage: 'Delete/Discard/Sign out button text, Danger border',
              },
              {
                token: 'Success', hex: '#34C759', label: 'Mastered badge',
                example: <span style={{ fontSize: 10, fontWeight: 700, color: '#2A7A3A', background: 'rgba(42,122,58,0.10)', border: '1px solid rgba(42,122,58,0.18)', borderRadius: 6, padding: '3px 10px' }}>Mastered</span>,
                usage: 'Mastered pattern badge, Completion indicator',
              },
            ].map(({ token, hex, label, example, usage }) => (
              <div key={token} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--pd)' }}>
                {/* Token info */}
                <div>
                  <code style={{ fontSize: 11, fontWeight: 700, color: 'var(--pt)', display: 'block', marginBottom: 3 }}>{token}</code>
                  <div style={{ fontSize: 10, color: 'var(--pm2)', marginBottom: 2, fontFamily: 'monospace' }}>{hex}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--pm2)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
                </div>
                {/* Real example + usage */}
                <div>
                  <div style={{ marginBottom: 8 }}>{example}</div>
                  <div style={{ fontSize: 10, color: 'var(--pm2)' }}>
                    <span style={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Usage </span>{usage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Sub>

        {/* ── Shadow ── */}
        <Sub title="Shadow">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                label: 'XS', value: '0 1px 4px rgba(0,0,0,0.08)',
                example: (
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pt)', background: 'var(--pglass)', border: '1px solid var(--pglass-border)', borderRadius: 6, padding: '3px 10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>New</span>
                ),
                usage: 'Small badge, Status chip',
              },
              {
                label: 'SM', value: '0 2px 12px rgba(0,0,0,0.10)',
                example: (
                  <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', fontSize: 13, color: 'var(--pt)', fontWeight: 600, display: 'inline-block' }}>Search patterns…</div>
                ),
                usage: 'Input field, Small card',
              },
              {
                label: 'MD', value: '0 4px 20px rgba(0,0,0,0.12)',
                example: (
                  <div style={{ padding: '14px 16px', borderRadius: 20, background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--pglass-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', maxWidth: 280 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', marginBottom: 4 }}>STORY 01</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', marginBottom: 3 }}>A New Start</div>
                    <div style={{ fontSize: 12, color: 'var(--pm)' }}>In Progress · 60%</div>
                  </div>
                ),
                usage: 'Story card, Progress card, Library card',
              },
              {
                label: 'LG', value: '0 8px 40px rgba(0,0,0,0.14)',
                example: (
                  <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 12px', borderRadius: 16, background: 'var(--pglass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid var(--pglass-border)', boxShadow: '0 8px 40px rgba(0,0,0,0.14)', maxWidth: 280 }}>
                    {[Home, BookOpen, PenLine, BarChart2, BookMarked].map((Icon, i) => (
                      <Icon key={i} size={20} style={{ color: i === 0 ? 'var(--pt)' : 'var(--pm)' }} strokeWidth={i === 0 ? 2 : 1.6} />
                    ))}
                  </div>
                ),
                usage: 'Bottom Navigation bar',
              },
              {
                label: 'Dialog', value: '0 8px 48px rgba(0,0,0,0.16)',
                example: (
                  <div style={{ borderRadius: 20, background: 'var(--pglass)', backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)', border: '1px solid var(--pglass-border)', boxShadow: '0 8px 48px rgba(0,0,0,0.16)', overflow: 'hidden', maxWidth: 280 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 14px 0' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--pt)', letterSpacing: '-0.01em' }}>Delete Essay?</span>
                      <div style={{ width: 22, height: 22, borderRadius: 999, background: 'rgba(120,120,128,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={9} style={{ color: 'var(--pm)' }} strokeWidth={2.2} />
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--pm)', margin: '6px 14px 0' }}>This action cannot be undone.</p>
                    <div style={{ display: 'flex', gap: 8, padding: '12px 14px 14px' }}>
                      <button type="button" style={{ flex: 1, padding: '9px 0', borderRadius: 11, fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'default', background: 'var(--pglass)', border: '1px solid var(--pglass-border)', color: 'var(--pm)' }}>Cancel</button>
                      <button type="button" style={{ flex: 1, padding: '9px 0', borderRadius: 11, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'default', background: 'none', border: '1px solid rgba(180,74,90,0.22)', color: BURGUNDY }}>Delete</button>
                    </div>
                  </div>
                ),
                usage: 'All PDialog modals, TodayMissionPopup',
              },
              {
                label: 'FAB', value: '0 4px 20px rgba(0,0,0,0.18)',
                example: (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--pt)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
                    <Plus size={22} style={{ color: 'var(--pb)' }} strokeWidth={2.5} />
                  </div>
                ),
                usage: 'Floating Action Button (new essay)',
              },
            ].map(({ label, value, example, usage }) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--pd)' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)', marginBottom: 4 }}>{label}</div>
                  <code style={{ fontSize: 9.5, color: 'var(--pm)', fontFamily: 'monospace', lineHeight: 1.5, display: 'block' }}>{value}</code>
                  <div style={{ fontSize: 10, color: 'var(--pm2)', marginTop: 6 }}>
                    <span style={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Usage </span>{usage}
                  </div>
                </div>
                <div>{example}</div>
              </div>
            ))}
          </div>
        </Sub>

        {/* ── Glass ── */}
        <Sub title="Glass">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                label: 'Dialog Glass', blur: 'blur(32px) saturate(180%)',
                example: (
                  <div style={{ padding: '12px 14px', borderRadius: 16, background: 'var(--pglass)', backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)', border: '1px solid var(--pglass-border)', maxWidth: 220 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--pt)', marginBottom: 4 }}>Install PATTO</div>
                    <div style={{ fontSize: 11, color: 'var(--pm)' }}>Add to your Home Screen for quick access.</div>
                  </div>
                ),
                usage: 'PDialog, TodayMissionPopup — strongest glass, depth over content',
              },
              {
                label: 'Nav / Card Glass', blur: 'blur(24px) saturate(180%)',
                example: (
                  <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 20px', borderRadius: 16, background: 'var(--pglass)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid var(--pglass-border)', maxWidth: 260 }}>
                    {[Home, BookOpen, PenLine, BarChart2, BookMarked].map((Icon, i) => (
                      <Icon key={i} size={20} style={{ color: i === 0 ? 'var(--pt)' : 'var(--pm)' }} strokeWidth={i === 0 ? 2 : 1.6} />
                    ))}
                  </div>
                ),
                usage: 'Bottom Nav, Top Nav, Card, Secondary button, Back button',
              },
              {
                label: 'Subtle Glass', blur: 'blur(16px) saturate(160%)',
                example: (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['All', 'New', 'Review'].map((t, i) => (
                      <div key={t} style={{ padding: '6px 14px', borderRadius: 20, background: 'var(--pglass)', backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)', border: '1px solid var(--pglass-border)', fontSize: 12, fontWeight: 600, color: i === 0 ? 'var(--pt)' : 'var(--pm)' }}>{t}</div>
                    ))}
                  </div>
                ),
                usage: 'Filter chip, Small badge, Input (light variant)',
              },
            ].map(({ label, blur, example, usage }) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--pd)' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)', marginBottom: 4 }}>{label}</div>
                  <code style={{ fontSize: 9.5, color: 'var(--pm)', display: 'block', lineHeight: 1.5 }}>{blur}</code>
                  <div style={{ fontSize: 10, color: 'var(--pm2)', marginTop: 6 }}>
                    <span style={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Usage </span>{usage}
                  </div>
                </div>
                <div>{example}</div>
              </div>
            ))}
          </div>
        </Sub>

        {/* ── Border ── */}
        <Sub title="Border">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                label: '--pglass-border', value: 'rgba(255,255,255,0.85) / rgba(143,171,255,0.12)',
                example: (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 320 }}>
                    <div style={{ padding: '12px 14px', borderRadius: 16, background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--pglass-border)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--pm2)', marginBottom: 3 }}>STORY 01</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--pt)' }}>A New Start</div>
                    </div>
                    <button type="button" style={{ padding: '11px 0', borderRadius: 14, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', color: 'var(--pm)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'default' }}>Cancel</button>
                  </div>
                ),
                usage: 'Card, Dialog, Bottom Nav, Secondary button, Input field, Back button',
              },
              {
                label: '--pd (Divider)', value: 'rgba(60,60,67,0.10) / rgba(255,255,255,0.10)',
                example: (
                  <div style={{ maxWidth: 260 }}>
                    {['Account Settings', 'Language', 'Notifications'].map((item, i) => (
                      <div key={item}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0' }}>
                          <span style={{ fontSize: 13, color: 'var(--pt)' }}>{item}</span>
                          <ChevronDown size={13} style={{ color: 'var(--pm2)', transform: 'rotate(-90deg)' }} />
                        </div>
                        {i < 2 && <div style={{ height: 1, background: 'var(--pd)' }} />}
                      </div>
                    ))}
                  </div>
                ),
                usage: 'List row divider, Dialog section separator, Progress bar track',
              },
              {
                label: '--pacb (Accent Card Border)', value: 'rgba(109,141,255,0.20) / rgba(143,171,255,0.28)',
                example: (
                  <div style={{ padding: '12px 16px', borderRadius: 16, background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--pacb)', maxWidth: 220 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pa)', marginBottom: 4 }}>PREMIUM</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--pt)' }}>₩9,900 / month</div>
                  </div>
                ),
                usage: 'Subscription card, Highlighted feature card',
              },
              {
                label: 'Danger border', value: 'rgba(180,74,90,0.22)',
                example: (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" style={{ padding: '10px 20px', borderRadius: 14, background: 'none', border: '1px solid rgba(180,74,90,0.22)', color: BURGUNDY, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'default' }}>Delete</button>
                    <button type="button" style={{ padding: '10px 20px', borderRadius: 14, background: 'none', border: '1px solid rgba(180,74,90,0.22)', color: BURGUNDY, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'default' }}>Sign out</button>
                  </div>
                ),
                usage: 'Danger/destructive action buttons (Delete, Sign out, Discard)',
              },
            ].map(({ label, value, example, usage }) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--pd)' }}>
                <div>
                  <code style={{ fontSize: 11, fontWeight: 700, color: 'var(--pt)', display: 'block', marginBottom: 3 }}>{label}</code>
                  <div style={{ fontSize: 9.5, color: 'var(--pm2)', fontFamily: 'monospace', lineHeight: 1.5, marginBottom: 6 }}>{value}</div>
                  <div style={{ fontSize: 10, color: 'var(--pm2)' }}>
                    <span style={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Usage </span>{usage}
                  </div>
                </div>
                <div>{example}</div>
              </div>
            ))}
          </div>
        </Sub>

        {/* ── Border Radius ── */}
        <Sub title="Border Radius">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { r: 6,   label: 'r6',  comp: 'Mastery badge, Score label',
                example: <span style={{ fontSize: 10, fontWeight: 700, color: '#2A7A3A', background: 'rgba(42,122,58,0.10)', border: '1px solid rgba(42,122,58,0.18)', borderRadius: 6, padding: '3px 10px' }}>Mastered</span> },
              { r: 12,  label: 'r12', comp: 'Input field',
                example: <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', fontSize: 13, color: 'var(--pm)', display: 'inline-block' }}>Search patterns…</div> },
              { r: 14,  label: 'r14', comp: 'Button (standard)',
                example: <button type="button" style={{ padding: '10px 20px', borderRadius: 14, background: 'var(--pt)', color: 'var(--pb)', fontSize: 13, fontWeight: 700, border: 'none', fontFamily: 'inherit', cursor: 'default' }}>Save Draft</button> },
              { r: 20,  label: 'r20', comp: 'Filter chip, Toast, Story card inner',
                example: (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ padding: '7px 16px', borderRadius: 20, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', fontSize: 12, fontWeight: 600, color: 'var(--pm)' }}>Review</span>
                    <span style={{ padding: '7px 16px', borderRadius: 20, background: 'var(--pt)', color: 'var(--pb)', fontSize: 12, fontWeight: 600 }}>All</span>
                  </div>
                ) },
              { r: 20,  label: 'r20', comp: 'Card (standard)',
                example: (
                  <div style={{ padding: '14px 16px', borderRadius: 20, background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--pglass-border)', maxWidth: 240 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pm2)', marginBottom: 3 }}>STORY 01</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)' }}>A New Start</div>
                  </div>
                ) },
              { r: 28,  label: 'r28', comp: 'Dialog',
                example: (
                  <div style={{ padding: '14px 16px', borderRadius: 28, background: 'var(--pglass)', backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)', border: '1px solid var(--pglass-border)', boxShadow: '0 8px 48px rgba(0,0,0,0.16)', maxWidth: 240 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--pt)', marginBottom: 4 }}>Sign out?</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button type="button" style={{ flex: 1, padding: '9px 0', borderRadius: 11, fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'default', background: 'var(--pglass)', border: '1px solid var(--pglass-border)', color: 'var(--pm)' }}>Cancel</button>
                      <button type="button" style={{ flex: 1, padding: '9px 0', borderRadius: 11, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'default', background: 'none', border: '1px solid rgba(180,74,90,0.22)', color: BURGUNDY }}>Sign out</button>
                    </div>
                  </div>
                ) },
              { r: 999, label: 'r∞',  comp: 'Pill chip, Toast notification, X button',
                example: (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ background: 'var(--pt)', color: 'var(--pb)', fontSize: 12, padding: '8px 18px', borderRadius: 999, fontWeight: 600 }}>Essay saved.</div>
                    <div style={{ width: 28, height: 28, borderRadius: 999, background: 'rgba(120,120,128,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={11} style={{ color: 'var(--pm)' }} strokeWidth={2.2} />
                    </div>
                  </div>
                ) },
            ].map(({ r, label, comp, example }, idx) => (
              <div key={`${label}-${idx}`} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--pd)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 32, height: 32, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', borderRadius: r, flexShrink: 0 }} />
                    <code style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)' }}>{r === 999 ? '∞' : r}px</code>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--pm2)' }}>
                    <span style={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Usage </span>{comp}
                  </div>
                </div>
                <div>{example}</div>
              </div>
            ))}
          </div>
        </Sub>

        {/* ── Spacing ── */}
        <Sub title="Spacing">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { s: 8,  comp: 'Button gap, Action row gap (2-btn)', example: <div style={{ display: 'flex', gap: 8 }}><button type="button" style={{ flex: 1, padding: '10px 0', borderRadius: 12, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', color: 'var(--pm)', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'default' }}>Cancel</button><button type="button" style={{ flex: 1, padding: '10px 0', borderRadius: 12, background: 'none', border: '1px solid rgba(180,74,90,0.22)', color: BURGUNDY, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'default' }}>Delete</button></div> },
              { s: 10, comp: 'Action row gap (3-btn)', example: <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 200 }}>{['Save Draft', 'Discard', 'Cancel'].map(t => <button key={t} type="button" style={{ padding: '8px 0', borderRadius: 11, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', color: 'var(--pm)', fontSize: 11, fontWeight: 500, fontFamily: 'inherit', cursor: 'default' }}>{t}</button>)}</div> },
              { s: 14, comp: 'Card inner gap', example: <div style={{ padding: '14px 16px', borderRadius: 16, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 220 }}><div style={{ height: 10, borderRadius: 4, background: 'var(--pd)', width: '70%' }} /><div style={{ height: 10, borderRadius: 4, background: 'var(--pd)', width: '50%' }} /></div> },
              { s: 20, comp: 'Page horizontal padding, Card padding', example: <div style={{ padding: '0 20px', background: 'var(--pd)', borderRadius: 8, display: 'flex', alignItems: 'center', height: 36, position: 'relative', maxWidth: 220 }}><div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 20, background: 'rgba(109,141,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 9, fontWeight: 700, color: 'var(--pa)', writingMode: 'vertical-rl' }}>20</span></div><div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 20, background: 'rgba(109,141,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 9, fontWeight: 700, color: 'var(--pa)', writingMode: 'vertical-rl' }}>20</span></div><span style={{ fontSize: 11, color: 'var(--pm)', margin: '0 auto' }}>Content</span></div> },
              { s: 22, comp: 'Dialog title top padding', example: <div style={{ paddingTop: 22, paddingLeft: 14, paddingRight: 14, borderRadius: 16, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', maxWidth: 220 }}><span style={{ fontSize: 14, fontWeight: 800, color: 'var(--pt)' }}>Dialog Title</span><div style={{ height: 40 }} /></div> },
              { s: 28, comp: 'Section spacing', example: <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}><div style={{ height: 1, background: 'var(--pd)' }} /><div style={{ height: 28, display: 'flex', alignItems: 'center' }}><span style={{ fontSize: 9, fontWeight: 700, color: 'var(--pm2)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>↕ 28px between sections</span></div><div style={{ height: 1, background: 'var(--pd)' }} /></div> },
            ].map(({ s, comp, example }) => (
              <div key={s} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--pd)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: s, height: s, background: 'var(--pt)', borderRadius: 3, opacity: 0.2, flexShrink: 0, minWidth: s }} />
                    <code style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)' }}>{s}px</code>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--pm2)' }}>
                    <span style={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Usage </span>{comp}
                  </div>
                </div>
                <div>{example}</div>
              </div>
            ))}
          </div>
        </Sub>

        {/* ── Animation ── */}
        <Sub title="Animation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Dialog open',  val: '220ms cubic-bezier(0.34,1.56,0.64,1)', usage: 'PDialog card scale+fade, TodayMissionPopup', note: 'Spring bounce — feels snappy and alive' },
              { label: 'Toast fade',   val: '200ms ease',                             usage: 'Toast notification appear/disappear', note: 'Fast linear fade, unobtrusive' },
              { label: 'Button press', val: '150ms ease',                             usage: 'opacity on tap, background on hover', note: 'Instant feedback, sub-100ms perceived' },
              { label: 'Tab switch',   val: '250ms cubic-bezier(0.25,0.1,0.25,1)',   usage: 'Bottom nav icon color transition', note: 'Smooth standard ease-out' },
              { label: 'Swipe row',   val: '220ms cubic-bezier(0.25,0.1,0.25,1)',   usage: 'Swipeable list row reveal', note: 'Matches spring duration of dialog' },
            ].map(({ label, val, usage, note }) => (
              <div key={label} style={{ padding: '14px 0', borderBottom: '1px solid var(--pd)' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 100, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--pt)', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 10, color: 'var(--pm2)' }}>
                      <span style={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Usage </span>{usage}
                    </div>
                  </div>
                  <div>
                    <code style={{ fontSize: 10, color: 'var(--pm)', background: 'var(--pglass)', border: '1px solid var(--pglass-border)', borderRadius: 6, padding: '3px 8px', display: 'inline-block', marginBottom: 4 }}>{val}</code>
                    <div style={{ fontSize: 10, color: 'var(--pm2)', fontStyle: 'italic' }}>{note}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Sub>

        {/* ── Icon Size ── */}
        <Sub title="Icon Size">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { s: 12, comp: 'X close button icon', example: <div style={{ width: 28, height: 28, borderRadius: 999, background: 'rgba(120,120,128,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} style={{ color: 'var(--pm)' }} strokeWidth={2.2} /></div> },
              { s: 14, comp: 'Chevron, small action icon', example: <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--pt)', fontWeight: 500 }}>Settings <ChevronDown size={14} style={{ color: 'var(--pm2)', transform: 'rotate(-90deg)' }} /></div> },
              { s: 16, comp: 'Back arrow, input leading icon', example: <div style={{ display: 'flex', gap: 12 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--pt)', fontWeight: 600 }}><ArrowLeft size={16} strokeWidth={2.5} />Back</div><div style={{ position: 'relative', display: 'inline-block' }}><Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--pm)' }} /><input readOnly placeholder="Search…" style={{ paddingLeft: 32, padding: '8px 12px 8px 32px', borderRadius: 10, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', fontSize: 12, color: 'var(--pt)', outline: 'none', fontFamily: 'inherit' }} /></div></div> },
              { s: 20, comp: 'Bottom nav icon', example: <div style={{ display: 'flex', gap: 20, padding: '8px 16px', borderRadius: 12, background: 'var(--pglass)', border: '1px solid var(--pglass-border)' }}>{[Home, BookOpen, PenLine, BarChart2, BookMarked].map((Icon, i) => <Icon key={i} size={20} style={{ color: i === 0 ? 'var(--pt)' : 'var(--pm)' }} strokeWidth={i === 0 ? 2 : 1.6} />)}</div> },
              { s: 22, comp: 'Profile avatar icon, Empty state icon', example: <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--pglass)', border: '1px solid var(--pglass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={22} style={{ color: 'var(--pm)' }} /></div><div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(109,141,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PenLine size={22} style={{ color: 'var(--pa)' }} strokeWidth={1.6} /></div></div> },
              { s: 24, comp: 'FAB icon', example: <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--pt)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}><Plus size={24} style={{ color: 'var(--pb)' }} strokeWidth={2.5} /></div> },
            ].map(({ s, comp, example }) => (
              <div key={s} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--pd)' }}>
                <div>
                  <code style={{ fontSize: 13, fontWeight: 800, color: 'var(--pt)', display: 'block', marginBottom: 4 }}>{s}px</code>
                  <div style={{ fontSize: 10, color: 'var(--pm2)' }}>
                    <span style={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Usage </span>{comp}
                  </div>
                </div>
                <div>{example}</div>
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
