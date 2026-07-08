'use client'

import { useState } from 'react'
import { Home, BookOpen, PenLine, BarChart2, BookMarked, User, X, Plus, ChevronRight, Search, ArrowLeft, Star, RefreshCw } from 'lucide-react'

// ── Device presets ────────────────────────────────────────────────────────────

const DEVICES = [
  { id: 'se',      label: 'iPhone SE',      w: 375, h: 667 },
  { id: 'pro',     label: 'iPhone 16 Pro',  w: 393, h: 852 },
  { id: 'pixel',   label: 'Android Pixel',  w: 393, h: 873 },
  { id: 'ipad',    label: 'iPad',           w: 820, h: 1024 },
  { id: 'desktop', label: 'Desktop',        w: 1280, h: 800 },
]

type DeviceId = typeof DEVICES[number]['id']
type ScreenId = 'HOME' | 'STORY' | 'ESSAYS' | 'PROGRESS' | 'LIBRARY' | 'ACCOUNT'

const SCREENS: ScreenId[] = ['HOME', 'STORY', 'ESSAYS', 'PROGRESS', 'LIBRARY', 'ACCOUNT']

const BURGUNDY = '#B44A5A'

// ── Design tokens (scoped inline for dark override) ───────────────────────────

const DARK_VARS: React.CSSProperties = {
  '--pb':           '#0C0C14',
  '--pglass':       'rgba(26,26,42,0.80)',
  '--pglass-border':'rgba(143,171,255,0.12)',
  '--pt':           '#F2F2F5',
  '--pt2':          '#E0E0EA',
  '--pm':           '#9090AA',
  '--pm2':          '#5A5A72',
  '--pa':           '#8FABFF',
  '--pal':          'rgba(143,171,255,0.12)',
  '--pd':           'rgba(255,255,255,0.10)',
  '--pacb':         'rgba(143,171,255,0.30)',
  '--pbnav':        '#131320',
  '--pbtop':        'rgba(12,12,20,0.80)',
} as React.CSSProperties

const LIGHT_VARS: React.CSSProperties = {
  '--pb':           '#FAFAFA',
  '--pglass':       'rgba(255,255,255,0.72)',
  '--pglass-border':'rgba(255,255,255,0.85)',
  '--pt':           '#1C1C1E',
  '--pt2':          '#3A3A3C',
  '--pm':           '#6E6E73',
  '--pm2':          '#8E8E93',
  '--pa':           '#6D8DFF',
  '--pal':          'rgba(109,141,255,0.10)',
  '--pd':           'rgba(60,60,67,0.10)',
  '--pacb':         'rgba(109,141,255,0.30)',
  '--pbnav':        '#F2F2F7',
  '--pbtop':        'rgba(250,250,250,0.80)',
} as React.CSSProperties

// ── Small reusable pieces ─────────────────────────────────────────────────────

function GlassChip({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap',
      background: active ? 'var(--pa)' : 'var(--pglass)',
      color: active ? '#fff' : 'var(--pm)',
      border: active ? 'none' : '1px solid var(--pglass-border)',
    }}>{children}</span>
  )
}

function FilterRow({ items, active }: { items: string[]; active: number }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '0 20px 14px', overflowX: 'auto' }}>
      {items.map((t, i) => <GlassChip key={t} active={i === active}>{t}</GlassChip>)}
    </div>
  )
}

function BottomNav({ active }: { active: number }) {
  const tabs = [
    { Icon: Home, label: 'HOME' }, { Icon: BookOpen, label: 'STORY' },
    { Icon: PenLine, label: 'ESSAYS' }, { Icon: BarChart2, label: 'PROGRESS' },
    { Icon: BookMarked, label: 'LIBRARY' },
  ]
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 72,
      background: 'var(--pglass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid var(--pglass-border)', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    }}>
      {tabs.map(({ Icon, label }, i) => {
        const a = i === active
        return (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
            <Icon size={22} style={{ color: a ? 'var(--pa)' : 'var(--pm)', strokeWidth: a ? 2 : 1.6 }} />
            <span style={{ fontSize: 9, fontWeight: a ? 700 : 500, letterSpacing: '0.08em', color: a ? 'var(--pa)' : 'var(--pm2)', textTransform: 'uppercase' }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

function TopNav({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10, padding: '14px 20px',
      background: 'var(--pbtop)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--pglass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <p style={{ fontSize: 20, fontWeight: 900, color: 'var(--pt)', margin: 0, letterSpacing: '-0.025em' }}>{title}</p>
      {right}
    </div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--pglass)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid var(--pglass-border)', borderRadius: 20, padding: '14px 16px',
      ...style,
    }}>{children}</div>
  )
}

function MiniDialog({ title, desc, actions }: { title: string; desc?: string; actions: Array<{ label: string; v?: string }> }) {
  const isRow = actions.length === 2
  return (
    <div style={{
      background: 'var(--pglass)', backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)',
      border: '1px solid var(--pglass-border)', borderRadius: 20, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 14px 0' }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--pt)', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.25 }}>{title}</p>
        <div style={{ background: 'rgba(120,120,128,0.10)', borderRadius: 999, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 6 }}>
          <X style={{ width: 9, height: 9, color: 'var(--pm)' }} strokeWidth={2.2} />
        </div>
      </div>
      {desc && <p style={{ fontSize: 11, color: 'var(--pm)', margin: '6px 14px 0', lineHeight: 1.5 }}>{desc}</p>}
      <div style={{ display: 'flex', flexDirection: isRow ? 'row' : 'column', gap: isRow ? 6 : 7, padding: '12px 14px 14px' }}>
        {actions.map((a, i) => {
          const v = a.v ?? 'primary'
          const s: React.CSSProperties =
            v === 'primary'  ? { background: 'var(--pt)', color: 'var(--pb)', border: 'none' }
            : v === 'danger' ? { background: 'none', color: BURGUNDY, border: '1px solid rgba(180,74,90,0.20)' }
            : v === 'text'   ? { background: 'none', color: 'var(--pa)', border: 'none' }
            : { background: 'var(--pglass)', border: '1px solid var(--pglass-border)', color: 'var(--pm)' }
          return (
            <button key={i} type="button" style={{ flex: 1, padding: '9px 0', borderRadius: 11, fontSize: 11, fontWeight: v === 'secondary' ? 500 : 700, fontFamily: 'inherit', cursor: 'default', minWidth: 0, ...s }}>
              {a.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Screen mocks ──────────────────────────────────────────────────────────────

function HomeScreen() {
  return (
    <div style={{ background: 'var(--pb)', height: '100%', overflowY: 'auto', paddingBottom: 80 }}>
      <TopNav title="PATTO" right={<div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--pglass)', border: '1px solid var(--pglass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} style={{ color: 'var(--pm)' }} /></div>} />
      <div style={{ padding: '20px 20px 0' }}>
        <Card style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 4px' }}>TODAY&apos;S MISSION</p>
          <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--pt)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Story 03 · A Busy Day</p>
          <p style={{ fontSize: 12, color: 'var(--pm)', margin: '0 0 12px' }}>5 patterns · 10 min</p>
          <button type="button" style={{ width: '100%', padding: '11px 0', borderRadius: 13, background: 'var(--pa)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'default', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            Start <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          {[{ n: '12', l: 'Reviews' }, { n: '3', l: 'Streak' }, { n: '72%', l: 'Score' }].map(({ n, l }) => (
            <Card key={l} style={{ flex: 1, textAlign: 'center', padding: '12px 8px' }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--pt)', margin: 0, letterSpacing: '-0.03em' }}>{n}</p>
              <p style={{ fontSize: 10, color: 'var(--pm2)', margin: 0 }}>{l}</p>
            </Card>
          ))}
        </div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 10px' }}>CONTINUE LEARNING</p>
        {[{ story: '01', title: 'A New Start', prog: 60 }, { story: '02', title: 'Weekend Plans', prog: 30 }].map(({ story, title, prog }) => (
          <Card key={story} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(109,141,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={16} style={{ color: 'var(--pa)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 1px' }}>STORY {story}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--pt)', margin: '0 0 4px' }}>{title}</p>
              <div style={{ height: 3, borderRadius: 99, background: 'var(--pd)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${prog}%`, background: 'var(--pa)', borderRadius: 99 }} />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav active={0} />
    </div>
  )
}

function StoryScreen() {
  return (
    <div style={{ background: 'var(--pb)', height: '100%', overflowY: 'auto', paddingBottom: 80 }}>
      <TopNav title="Stories" right={<div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--pglass)', border: '1px solid var(--pglass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={13} style={{ color: 'var(--pm)' }} /></div>} />
      <FilterRow items={['All', 'In Progress', 'New', 'Completed']} active={0} />
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[{ n: '01', t: 'A New Start', k: '새로운 시작', prog: 60, status: 'In Progress' }, { n: '02', t: 'Weekend Plans', k: '주말 계획', prog: 30, status: 'In Progress' }, { n: '03', t: 'A Busy Day', k: '바쁜 하루', prog: 0, status: 'New' }].map(({ n, t, k, prog, status }) => (
          <Card key={n} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 52, background: `linear-gradient(135deg, rgba(109,141,255,0.2) 0%, rgba(180,180,255,0.08) 100%)`, display: 'flex', alignItems: 'center', paddingLeft: 14 }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pa)', margin: 0 }}>STORY {n}</p>
            </div>
            <div style={{ padding: '10px 14px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: 0 }}>{t}</p>
                  <p style={{ fontSize: 11, color: 'var(--pm)', margin: '1px 0 0' }}>{k}</p>
                </div>
                <GlassChip active={status === 'New'}>{status}</GlassChip>
              </div>
              {prog > 0 && <div style={{ height: 3, borderRadius: 99, background: 'var(--pd)', overflow: 'hidden', marginTop: 8 }}>
                <div style={{ height: '100%', width: `${prog}%`, background: 'var(--pa)', borderRadius: 99 }} />
              </div>}
            </div>
          </Card>
        ))}
      </div>
      <BottomNav active={1} />
    </div>
  )
}

function EssaysScreen() {
  return (
    <div style={{ background: 'var(--pb)', height: '100%', overflowY: 'auto', paddingBottom: 80 }}>
      <TopNav title="Essays" />
      <FilterRow items={['All', 'Draft', 'Published']} active={0} />
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[{ t: 'A New Start', s: 'Story 01', d: 'Draft', words: 124 }, { t: 'My Weekend', s: 'Story 02', d: 'Published', words: 208 }].map(({ t, s, d, words }) => (
          <Card key={t}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 2px' }}>{s}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: 0 }}>{t}</p>
              </div>
              <GlassChip active={d === 'Draft'}>{d}</GlassChip>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--pm)', lineHeight: 1.55, margin: '0 0 8px' }}>I decided to try something completely new this week…</p>
            <p style={{ fontSize: 10, color: 'var(--pm2)', margin: 0 }}>{words} words</p>
          </Card>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 88, right: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--pa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(109,141,255,0.4)' }}>
          <Plus size={22} style={{ color: '#fff' }} strokeWidth={2.5} />
        </div>
      </div>
      <BottomNav active={2} />
    </div>
  )
}

function ProgressScreen() {
  return (
    <div style={{ background: 'var(--pb)', height: '100%', overflowY: 'auto', paddingBottom: 80 }}>
      <TopNav title="Progress" />
      <div style={{ padding: '20px 20px 0' }}>
        <Card style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 12px' }}>THIS WEEK</p>
          <div style={{ display: 'flex', gap: 0 }}>
            {[{ n: '12', l: 'Reviews' }, { n: '3', l: 'Stories' }, { n: '72%', l: 'Avg Score' }, { n: '5', l: 'Streak' }].map(({ n, l }, i) => (
              <div key={l} style={{ flex: 1, textAlign: 'center', borderRight: i < 3 ? '1px solid var(--pd)' : 'none', paddingTop: 2, paddingBottom: 2 }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--pt)', margin: 0, letterSpacing: '-0.03em' }}>{n}</p>
                <p style={{ fontSize: 9.5, color: 'var(--pm2)', margin: 0 }}>{l}</p>
              </div>
            ))}
          </div>
        </Card>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 10px' }}>PATTERN MASTERY</p>
        {[{ p: 'decide to', l: '~하기로 결심하다', m: 'Mastered' }, { p: 'end up -ing', l: '결국 ~하게 되다', m: 'Review' }, { p: 'used to', l: '예전에 ~하곤 했다', m: 'Learning' }].map(({ p, l, m }) => (
          <Card key={p} style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--pt)', margin: '0 0 1px' }}>{p}</p>
              <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>{l}</p>
            </div>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: m === 'Mastered' ? '#2A7A3A' : m === 'Review' ? '#7A6AC8' : '#C8913A', background: `${m === 'Mastered' ? '#2A7A3A' : m === 'Review' ? '#7A6AC8' : '#C8913A'}12`, borderRadius: 6, padding: '3px 8px', border: `1px solid ${m === 'Mastered' ? '#2A7A3A' : m === 'Review' ? '#7A6AC8' : '#C8913A'}28` }}>{m}</span>
          </Card>
        ))}
      </div>
      <BottomNav active={3} />
    </div>
  )
}

function LibraryScreen() {
  return (
    <div style={{ background: 'var(--pb)', height: '100%', overflowY: 'auto', paddingBottom: 80 }}>
      <TopNav title="Library" right={<div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--pglass)', border: '1px solid var(--pglass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={13} style={{ color: 'var(--pm)' }} /></div>} />
      <FilterRow items={['All', 'Saved', 'Patterns', 'Examples']} active={0} />
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[{ p: 'decide to', l: '~하기로 결심하다', ex: 'I decided to take a different approach.' }, { p: 'end up -ing', l: '결국 ~하게 되다', ex: 'We ended up staying home.' }, { p: 'used to', l: '예전에 ~하곤 했다', ex: 'I used to wake up early every day.' }].map(({ p, l, ex }) => (
          <Card key={p}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: '0 0 1px' }}>{p}</p>
                <p style={{ fontSize: 11, color: 'var(--pm)', margin: 0 }}>{l}</p>
              </div>
              <Star size={15} style={{ color: 'var(--pa)', fill: 'var(--pa)', marginTop: 2 }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--pm)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>{ex}</p>
          </Card>
        ))}
      </div>
      <BottomNav active={4} />
    </div>
  )
}

function AccountScreen() {
  return (
    <div style={{ background: 'var(--pb)', height: '100%', overflowY: 'auto', paddingBottom: 80 }}>
      <TopNav title="Account" />
      <div style={{ padding: '20px 20px 0' }}>
        <Card style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--pa) 0%, rgba(155,109,255,0.8) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={24} style={{ color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--pt)', margin: '0 0 2px' }}>John Doe</p>
            <p style={{ fontSize: 12, color: 'var(--pm)', margin: 0 }}>john@example.com</p>
          </div>
          <GlassChip>Premium</GlassChip>
        </Card>
        {[['Language', 'English'], ['Theme', 'System'], ['Notifications', 'On']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid var(--pd)' }}>
            <p style={{ fontSize: 14, color: 'var(--pt)', margin: 0, fontWeight: 500 }}>{k}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <p style={{ fontSize: 13, color: 'var(--pm)', margin: 0 }}>{v}</p>
              <ChevronRight size={14} style={{ color: 'var(--pm2)' }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 16 }}>
          {['Sign Out', 'Delete Account'].map((label, i) => (
            <button key={label} type="button" style={{ display: 'block', width: '100%', padding: '13px 0', borderRadius: 14, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'default', border: `1px solid rgba(180,74,90,${i === 0 ? '0.20' : '0.35'})`, background: 'none', color: BURGUNDY, marginBottom: 10 }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <BottomNav active={-1} />
    </div>
  )
}

// ── Dialog panels per screen ──────────────────────────────────────────────────

function DialogPanel({ screen }: { screen: ScreenId }) {
  const panels: Record<ScreenId, React.ReactNode> = {
    HOME: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--pm2)', margin: 0 }}>DIALOGS ON THIS SCREEN</p>
        <MiniDialog title="Add to Home Screen" desc="Install PATTO for faster access." actions={[{ label: 'Not now', v: 'secondary' }, { label: 'Install', v: 'primary' }]} />
        <MiniDialog title="Install PATTO on iPhone" desc="Open in Safari to add to Home Screen." actions={[{ label: 'Got it', v: 'text' }]} />
        <MiniDialog title="Today's Mission" desc="3 reviews · Story 01" actions={[{ label: 'Start Mission', v: 'primary' }]} />
      </div>
    ),
    STORY: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--pm2)', margin: 0 }}>DIALOGS ON THIS SCREEN</p>
        <MiniDialog title="Review Complete" desc="Story 01 review finished!" actions={[{ label: 'View Result', v: 'primary' }]} />
        <MiniDialog title="Network Error" desc="Please check your connection." actions={[{ label: 'Cancel', v: 'secondary' }, { label: 'Retry', v: 'primary' }]} />
      </div>
    ),
    ESSAYS: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--pm2)', margin: 0 }}>DIALOGS ON THIS SCREEN</p>
        <MiniDialog title="Discard draft?" desc="저장하지 않으면 이 글은 사라집니다." actions={[{ label: 'Save Draft', v: 'secondary' }, { label: 'Discard', v: 'danger' }, { label: 'Cancel', v: 'text' }]} />
        <MiniDialog title="Delete Essay?" desc="This action cannot be undone." actions={[{ label: 'Cancel', v: 'secondary' }, { label: 'Delete', v: 'danger' }]} />
      </div>
    ),
    PROGRESS: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--pm2)', margin: 0 }}>DIALOGS ON THIS SCREEN</p>
        <MiniDialog title="Score Information" desc="Current Score: 72%" actions={[{ label: 'OK', v: 'text' }]} />
        <MiniDialog title="Review Mastery" desc="How mastery levels work" actions={[{ label: 'OK', v: 'text' }]} />
      </div>
    ),
    LIBRARY: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--pm2)', margin: 0 }}>DIALOGS ON THIS SCREEN</p>
        <MiniDialog title="Network Error" desc="Please check your connection." actions={[{ label: 'Cancel', v: 'secondary' }, { label: 'Retry', v: 'primary' }]} />
      </div>
    ),
    ACCOUNT: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--pm2)', margin: 0 }}>DIALOGS ON THIS SCREEN</p>
        <MiniDialog title="Sign out?" actions={[{ label: 'Cancel', v: 'secondary' }, { label: 'Sign out', v: 'danger' }]} />
        <MiniDialog title="Delete your account?" desc="This action cannot be undone." actions={[{ label: 'Cancel', v: 'secondary' }, { label: 'Delete', v: 'danger' }]} />
        <MiniDialog title="Upgrade to Premium" desc="Unlock unlimited reviews and all patterns." actions={[{ label: 'Maybe later', v: 'text' }, { label: 'Subscribe', v: 'primary' }]} />
      </div>
    ),
  }
  return <>{panels[screen]}</>
}

// ── Screen router ─────────────────────────────────────────────────────────────

function ScreenContent({ screen }: { screen: ScreenId }) {
  switch (screen) {
    case 'HOME':     return <HomeScreen />
    case 'STORY':    return <StoryScreen />
    case 'ESSAYS':   return <EssaysScreen />
    case 'PROGRESS': return <ProgressScreen />
    case 'LIBRARY':  return <LibraryScreen />
    case 'ACCOUNT':  return <AccountScreen />
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function ScreensClient() {
  const [deviceId, setDeviceId] = useState<DeviceId>('pro')
  const [dark, setDark] = useState(false)
  const [screen, setScreen] = useState<ScreenId>('HOME')

  const device = DEVICES.find(d => d.id === deviceId) ?? DEVICES[1]
  const themeVars = dark ? DARK_VARS : LIGHT_VARS

  const isTablet = device.w >= 820
  const scale = isTablet ? Math.min(1, (window?.innerWidth ?? 1100) / (device.w + 60)) : 1

  return (
    <div style={{ minHeight: '100dvh', background: dark ? '#080810' : '#F2F2F2', padding: '28px 20px 100px', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#808090', margin: '0 0 6px' }}>PATTO · DEV ONLY</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: dark ? '#F2F2F5' : '#1C1C1E', margin: '0 0 6px', letterSpacing: '-0.03em' }}>Screen Showcase</h1>
        <p style={{ fontSize: 13, color: '#8888A0', margin: '0 0 20px', lineHeight: 1.5 }}>
          All 6 screens with their dialogs. → <a href="/dev/ui" style={{ color: '#6D8DFF', textDecoration: 'none', fontWeight: 600 }}>/dev/ui</a> · <a href="/dev/theme" style={{ color: '#6D8DFF', textDecoration: 'none', fontWeight: 600 }}>/dev/theme</a>
        </p>

        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {/* Device select */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DEVICES.map(d => (
              <button key={d.id} type="button" onClick={() => setDeviceId(d.id)}
                style={{ padding: '7px 13px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: deviceId === d.id ? '#6D8DFF' : 'rgba(120,120,128,0.12)', color: deviceId === d.id ? '#fff' : dark ? '#9090AA' : '#6E6E73', border: 'none' }}>
                {d.label} <span style={{ opacity: 0.65 }}>{d.w}×{d.h}</span>
              </button>
            ))}
          </div>
          {/* Dark toggle */}
          <button type="button" onClick={() => setDark(p => !p)}
            style={{ padding: '7px 16px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', color: dark ? '#F2F2F5' : '#1C1C1E', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          {/* Screen select */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SCREENS.map(s => (
              <button key={s} type="button" onClick={() => setScreen(s)}
                style={{ padding: '7px 13px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: screen === s ? (dark ? '#8FABFF' : '#6D8DFF') : 'rgba(120,120,128,0.10)', color: screen === s ? '#fff' : dark ? '#9090AA' : '#6E6E73', border: 'none' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Device frame + dialogs side by side */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
        {/* Device frame */}
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: '#808090', margin: '0 0 10px' }}>
            {device.label} · {device.w}×{device.h}
          </p>
          <div style={{
            width: device.w,
            height: device.h,
            maxWidth: isTablet ? 820 : device.w,
            borderRadius: device.w >= 820 ? 12 : 44,
            overflow: 'hidden',
            border: '3px solid rgba(128,128,160,0.25)',
            boxShadow: '0 12px 60px rgba(0,0,0,0.22)',
            flexShrink: 0,
            position: 'relative',
            transform: `scale(${Math.min(1, isTablet ? 0.75 : 1)})`,
            transformOrigin: 'top left',
            ...themeVars,
          }}>
            <ScreenContent screen={screen} />
          </div>
        </div>

        {/* Dialog panel */}
        <div style={{ maxWidth: 320, flex: 1, minWidth: 260, ...themeVars, background: dark ? 'rgba(26,26,42,0.6)' : 'rgba(255,255,255,0.6)', borderRadius: 20, padding: '20px', border: '1px solid ' + (dark ? 'rgba(143,171,255,0.12)' : 'rgba(0,0,0,0.08)') }}>
          <DialogPanel screen={screen} />
        </div>
      </div>

      {/* All screens grid */}
      <div style={{ marginTop: 60 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#808090', margin: '0 0 20px', borderBottom: '1px solid rgba(128,128,160,0.18)', paddingBottom: 8 }}>
          ALL SCREENS OVERVIEW (iPhone 16 Pro)
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
          {SCREENS.map(s => (
            <div key={s} onClick={() => setScreen(s)} style={{ cursor: 'pointer' }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: s === screen ? '#6D8DFF' : '#808090', margin: '0 0 8px' }}>{s}</p>
              <div style={{
                width: 120, height: 260, borderRadius: 20, overflow: 'hidden',
                border: s === screen ? '2px solid #6D8DFF' : '2px solid rgba(128,128,160,0.2)',
                boxShadow: s === screen ? '0 0 0 3px rgba(109,141,255,0.20)' : '0 4px 16px rgba(0,0,0,0.12)',
                transform: 'scale(1)', transition: 'border-color 0.15s',
                ...themeVars,
              }}>
                <div style={{ transform: 'scale(0.305)', transformOrigin: 'top left', width: 393, height: 852, pointerEvents: 'none' }}>
                  <ScreenContent screen={s} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
