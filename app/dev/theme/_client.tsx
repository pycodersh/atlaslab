'use client'

import { X, Search, ChevronDown, Eye } from 'lucide-react'

const BURGUNDY = '#B44A5A'

// ── Theme variable sets ───────────────────────────────────────────────────────

const LIGHT: React.CSSProperties = {
  '--pb':            '#FAFAFA',
  '--pglass':        'rgba(255,255,255,0.72)',
  '--pglass-border': 'rgba(255,255,255,0.85)',
  '--pt':            '#1C1C1E',
  '--pt2':           '#3A3A3C',
  '--pm':            '#6E6E73',
  '--pm2':           '#8E8E93',
  '--pa':            '#6D8DFF',
  '--pal':           'rgba(109,141,255,0.10)',
  '--pd':            'rgba(60,60,67,0.10)',
  '--pacb':          'rgba(109,141,255,0.30)',
  '--pbnav':         '#F2F2F7',
  '--pbtop':         'rgba(250,250,250,0.80)',
} as React.CSSProperties

const DARK: React.CSSProperties = {
  '--pb':            '#0C0C14',
  '--pglass':        'rgba(26,26,42,0.80)',
  '--pglass-border': 'rgba(143,171,255,0.12)',
  '--pt':            '#F2F2F5',
  '--pt2':           '#E0E0EA',
  '--pm':            '#9090AA',
  '--pm2':           '#5A5A72',
  '--pa':            '#8FABFF',
  '--pal':           'rgba(143,171,255,0.12)',
  '--pd':            'rgba(255,255,255,0.10)',
  '--pacb':          'rgba(143,171,255,0.30)',
  '--pbnav':         '#131320',
  '--pbtop':         'rgba(12,12,20,0.80)',
} as React.CSSProperties

// ── Panel ─────────────────────────────────────────────────────────────────────

const GC: React.CSSProperties = {
  background: 'var(--pglass)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid var(--pglass-border)',
  borderRadius: 16,
  padding: '14px 16px',
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 10px' }}>{label}</p>
      {children}
    </div>
  )
}

function ThemePanel({ mode, vars }: { mode: 'Light' | 'Dark'; vars: React.CSSProperties }) {
  const IBASE: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 13, fontFamily: 'inherit',
    background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid var(--pglass-border)', color: 'var(--pt)', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{
      flex: 1, minWidth: 300, borderRadius: 24, overflow: 'hidden',
      background: 'var(--pb)', border: '1px solid var(--pglass-border)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
      ...vars,
    }}>
      {/* Mode label */}
      <div style={{ padding: '14px 18px', background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--pglass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--pt)', margin: 0, letterSpacing: '-0.01em' }}>{mode} Mode</p>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pa)', background: 'var(--pal)', borderRadius: 20, padding: '3px 10px' }}>{mode === 'Light' ? '☀️' : '🌙'} {mode}</span>
      </div>

      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Primary Color */}
        <Row label="Primary Color">
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--pa)' }} />
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--pal)' }} />
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--pacb)', border: '1px solid var(--pa)' }} />
            <div style={{ width: 44, height: 44, borderRadius: 12, background: BURGUNDY }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {['--pa', '--pal', '--pacb', 'danger'].map(t => (
              <code key={t} style={{ fontSize: 9, color: 'var(--pm2)', width: 44, textAlign: 'center', display: 'block' }}>{t}</code>
            ))}
          </div>
        </Row>

        {/* Background */}
        <Row label="Background">
          <div style={{ display: 'flex', gap: 8 }}>
            {(['--pb', '--pbnav', '--pbtop'] as const).map(v => (
              <div key={v} style={{ flex: 1 }}>
                <div style={{ height: 36, borderRadius: 10, background: `var(${v})`, border: '1px solid var(--pglass-border)', marginBottom: 4 }} />
                <code style={{ fontSize: 9, color: 'var(--pm2)', display: 'block', textAlign: 'center' }}>{v}</code>
              </div>
            ))}
          </div>
        </Row>

        {/* Typography */}
        <Row label="Typography">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[{ css: '--pt', size: 18, weight: 800, label: 'Primary text' }, { css: '--pt2', size: 15, weight: 500, label: 'Body text' }, { css: '--pm', size: 13, weight: 400, label: 'Secondary text' }, { css: '--pm2', size: 11, weight: 400, label: 'Caption text' }].map(({ css, size, weight, label }) => (
              <div key={css} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: size, fontWeight: weight, color: `var(${css})` }}>{label}</span>
                <code style={{ fontSize: 9, color: 'var(--pm2)' }}>{css}</code>
              </div>
            ))}
          </div>
        </Row>

        {/* Buttons */}
        <Row label="Buttons">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" style={{ padding: '11px 0', borderRadius: 12, background: 'var(--pt)', color: 'var(--pb)', fontSize: 13, fontWeight: 700, border: 'none', fontFamily: 'inherit', cursor: 'default' }}>Primary</button>
            <button type="button" style={{ padding: '11px 0', borderRadius: 12, ...GC as object, fontSize: 13, fontWeight: 500, color: 'var(--pm)', cursor: 'default', fontFamily: 'inherit' }}>Secondary</button>
            <button type="button" style={{ padding: '11px 0', borderRadius: 12, background: 'none', border: `1px solid rgba(180,74,90,0.22)`, fontSize: 13, fontWeight: 700, color: BURGUNDY, cursor: 'default', fontFamily: 'inherit' }}>Danger</button>
            <button type="button" style={{ padding: '11px 0', borderRadius: 12, background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: 'var(--pa)', cursor: 'default', fontFamily: 'inherit' }}>Text</button>
          </div>
        </Row>

        {/* Input */}
        <Row label="Input">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--pm)' }} strokeWidth={2} />
              <input type="text" placeholder="Search…" readOnly style={{ ...IBASE, paddingLeft: 34 }} />
            </div>
            <div style={{ position: 'relative' }}>
              <input type="password" defaultValue="mysecret" readOnly style={{ ...IBASE, paddingRight: 38 }} />
              <Eye style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--pm)' }} strokeWidth={2} />
            </div>
            <div style={{ position: 'relative' }}>
              <select style={{ ...IBASE, appearance: 'none', paddingRight: 34 }}>
                <option>English</option>
              </select>
              <ChevronDown style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--pm)', pointerEvents: 'none' }} strokeWidth={2} />
            </div>
          </div>
        </Row>

        {/* Dialog */}
        <Row label="Dialog">
          <div style={{
            background: 'var(--pglass)', backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: '1px solid var(--pglass-border)', borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 8px 48px rgba(0,0,0,0.16)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 14px 0' }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--pt)', margin: 0, letterSpacing: '-0.01em' }}>Delete Essay?</p>
              <div style={{ background: 'rgba(120,120,128,0.10)', borderRadius: 999, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: 10, height: 10, color: 'var(--pm)' }} strokeWidth={2.2} />
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--pm)', margin: '6px 14px 0', lineHeight: 1.5 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 8, padding: '12px 14px 14px' }}>
              <button type="button" style={{ flex: 1, padding: '10px 0', borderRadius: 11, fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'default', ...GC as object, color: 'var(--pm)' }}>Cancel</button>
              <button type="button" style={{ flex: 1, padding: '10px 0', borderRadius: 11, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'default', background: 'none', border: '1px solid rgba(180,74,90,0.22)', color: BURGUNDY }}>Delete</button>
            </div>
          </div>
        </Row>

        {/* Toast */}
        <Row label="Toast">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Review complete!', 'Essay saved.', 'Network error.'].map(t => (
              <div key={t} style={{ display: 'inline-flex', alignSelf: 'flex-start', background: 'var(--pt)', color: 'var(--pb)', fontSize: 12, padding: '7px 16px', borderRadius: 999, fontWeight: 600 }}>{t}</div>
            ))}
          </div>
        </Row>

        {/* Card */}
        <Row label="Card">
          <div style={{ ...GC, padding: '14px 16px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 3px' }}>STORY 01</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pt)', margin: '0 0 3px' }}>A New Start</p>
            <p style={{ fontSize: 12, color: 'var(--pm)', lineHeight: 1.5, margin: '0 0 8px' }}>새로운 한 주의 시작</p>
            <div style={{ height: 3, borderRadius: 99, background: 'var(--pd)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '60%', background: 'var(--pa)', borderRadius: 99 }} />
            </div>
          </div>
        </Row>

        {/* Glass + Divider */}
        <Row label="Glass & Divider">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Dialog glass',  blur: 'blur(32px)', bg: 'var(--pglass)' },
              { label: 'Nav glass',     blur: 'blur(24px)', bg: 'var(--pglass)' },
              { label: 'Subtle glass',  blur: 'blur(16px)', bg: 'var(--pglass)' },
            ].map(g => (
              <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 52, height: 32, borderRadius: 10, background: g.bg, backdropFilter: g.blur, WebkitBackdropFilter: g.blur, border: '1px solid var(--pglass-border)', flexShrink: 0 }} />
                <code style={{ fontSize: 10, color: 'var(--pm)' }}>{g.label}</code>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--pd)', marginTop: 4 }} />
            <code style={{ fontSize: 10, color: 'var(--pm2)' }}>Divider: var(--pd)</code>
          </div>
        </Row>

        {/* Spacing */}
        <Row label="Spacing">
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {[8, 12, 14, 16, 20, 22, 24, 28].map(s => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: s, height: s, background: 'var(--pa)', borderRadius: 3, opacity: 0.7 }} />
                <code style={{ fontSize: 8.5, color: 'var(--pm2)' }}>{s}</code>
              </div>
            ))}
          </div>
        </Row>

        {/* Radius */}
        <Row label="Radius">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {[8, 12, 14, 16, 20, 28, 999].map(r => (
              <div key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 34, height: 34, background: 'var(--pa)', borderRadius: r, opacity: 0.65 }} />
                <code style={{ fontSize: 8.5, color: 'var(--pm2)' }}>{r === 999 ? '∞' : r}</code>
              </div>
            ))}
          </div>
        </Row>

        {/* Animation */}
        <Row label="Animation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { k: 'Dialog', v: '220ms cubic-bezier(0.34,1.56,0.64,1)' },
              { k: 'Toast',  v: '200ms ease' },
              { k: 'Button', v: '150ms ease' },
            ].map(({ k, v }) => (
              <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--pt)', width: 52, flexShrink: 0 }}>{k}</span>
                <code style={{ fontSize: 9.5, color: 'var(--pm)', background: 'var(--pglass)', border: '1px solid var(--pglass-border)', borderRadius: 6, padding: '2px 7px' }}>{v}</code>
              </div>
            ))}
          </div>
        </Row>

      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function ThemeQAClient() {
  return (
    <div style={{ minHeight: '100dvh', background: '#18181A', padding: '28px 20px 100px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#606070', margin: '0 0 6px' }}>PATTO · DEV ONLY</p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#F2F2F5', margin: '0 0 6px', letterSpacing: '-0.03em' }}>Theme QA</h1>
          <p style={{ fontSize: 13, color: '#808090', margin: 0, lineHeight: 1.5 }}>
            Light vs Dark side-by-side. Inline CSS variable overrides — no global class toggling. → <a href="/dev/ui" style={{ color: '#6D8DFF', textDecoration: 'none', fontWeight: 600 }}>/dev/ui</a> · <a href="/dev/screens" style={{ color: '#6D8DFF', textDecoration: 'none', fontWeight: 600 }}>/dev/screens</a>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <ThemePanel mode="Light" vars={LIGHT} />
          <ThemePanel mode="Dark" vars={DARK} />
        </div>

        {/* Raw token table */}
        <div style={{ marginTop: 48, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#808090', margin: 0 }}>RAW TOKEN VALUES</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  {['Token', 'Light', 'Dark'].map(h => (
                    <th key={h} style={{ padding: '8px 18px', textAlign: 'left', color: '#606070', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['--pb',           '#FAFAFA',                      '#0C0C14'],
                  ['--pglass',       'rgba(255,255,255,0.72)',        'rgba(26,26,42,0.80)'],
                  ['--pglass-border','rgba(255,255,255,0.85)',        'rgba(143,171,255,0.12)'],
                  ['--pt',           '#1C1C1E',                      '#F2F2F5'],
                  ['--pt2',          '#3A3A3C',                      '#E0E0EA'],
                  ['--pm',           '#6E6E73',                      '#9090AA'],
                  ['--pm2',          '#8E8E93',                      '#5A5A72'],
                  ['--pa',           '#6D8DFF',                      '#8FABFF'],
                  ['--pal',          'rgba(109,141,255,0.10)',        'rgba(143,171,255,0.12)'],
                  ['--pd',           'rgba(60,60,67,0.10)',           'rgba(255,255,255,0.10)'],
                  ['--pacb',         'rgba(109,141,255,0.30)',        'rgba(143,171,255,0.30)'],
                  ['--pbnav',        '#F2F2F7',                      '#131320'],
                  ['--pbtop',        'rgba(250,250,250,0.80)',        'rgba(12,12,20,0.80)'],
                  ['danger',         '#B44A5A',                      '#B44A5A'],
                ].map(([token, light, dark]) => (
                  <tr key={token} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '7px 18px' }}><code style={{ color: '#8FABFF' }}>{token}</code></td>
                    <td style={{ padding: '7px 18px' }}><code style={{ color: '#C0C0D0' }}>{light}</code></td>
                    <td style={{ padding: '7px 18px' }}><code style={{ color: '#C0C0D0' }}>{dark}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
