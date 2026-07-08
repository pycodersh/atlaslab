'use client'

import { useState } from 'react'
import { CheckCircle2, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import { PDialog } from '@/components/ui/PDialog'
import type { PDialogAction } from '@/components/ui/PDialog'

const BURGUNDY = '#B44A5A'

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 52 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 16px' }}>
        {title}
      </p>
      {children}
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 10, color: 'var(--pm2)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{children}</span>
}

function Row({ gap = 12, wrap = true, children }: { gap?: number; wrap?: boolean; children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', gap, alignItems: 'center' }}>{children}</div>
}

// ── Dialog Trigger ────────────────────────────────────────────────────────────

function DialogTrigger({
  label, desc, title, description, hint, children: dialogChildren, actions,
}: {
  label: string; desc?: string; title?: string; description?: string
  hint?: React.ReactNode; children?: React.ReactNode; actions?: PDialogAction[]
}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: '100%', padding: '11px 16px', borderRadius: 12, textAlign: 'left',
          background: 'var(--pglass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--pglass-border)', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: 'var(--pt)', fontFamily: 'inherit',
        }}
      >
        <div>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--pm)', marginTop: 2, fontWeight: 400 }}>{desc}</div>}
      </button>
      <PDialog
        open={open}
        onClose={close}
        title={title}
        description={description}
        hint={hint}
        actions={actions ?? [{ label: 'OK', onClick: close, variant: 'text' }]}
      >
        {dialogChildren}
      </PDialog>
    </div>
  )
}

// ── Toast Demo ────────────────────────────────────────────────────────────────

function ToastDemo() {
  const [toast, setToast] = useState<string | null>(null)

  function show(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  const items = [
    'Saved', 'Deleted', 'Copied', 'Review Complete', 'Network Error', 'Offline',
  ]

  return (
    <>
      <Row gap={8}>
        {items.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => show(s)}
            style={{ padding: '8px 14px', borderRadius: 20, background: 'var(--pglass)', border: '1px solid var(--pglass-border)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--pt)', fontFamily: 'inherit' }}
          >
            {s}
          </button>
        ))}
      </Row>
      {toast && (
        <div style={{ position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)', background: 'var(--pt)', color: 'var(--pb)', fontSize: 12.5, padding: '10px 22px', borderRadius: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 99999, whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>
          {toast}
        </div>
      )}
    </>
  )
}

// ── Button Catalog ─────────────────────────────────────────────────────────────

function Btn({ label, variant = 'primary', disabled = false, loading = false }: { label: string; variant?: string; disabled?: boolean; loading?: boolean }) {
  const s: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--pa)', color: '#fff', border: 'none' },
    secondary: { background: 'var(--pglass)', color: 'var(--pm)', border: '1px solid var(--pglass-border)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
    danger:    { background: 'none', color: BURGUNDY, border: `1px solid rgba(180,74,90,0.22)` },
    text:      { background: 'none', color: 'var(--pa)', border: 'none' },
  }
  return (
    <button
      type="button"
      disabled={disabled}
      style={{
        padding: '13px 20px', borderRadius: 14, cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
        opacity: disabled ? 0.45 : 1, minWidth: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        ...(s[variant] ?? s.primary),
      }}
    >
      {loading ? <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : label}
    </button>
  )
}

// ── Color Swatch ──────────────────────────────────────────────────────────────

function ColorSwatch({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: color, flexShrink: 0, border: '1px solid rgba(128,128,128,0.12)' }} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pt)' }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--pm)', fontFamily: 'monospace' }}>{color}</div>
      </div>
    </div>
  )
}

// ── Main Client Component ─────────────────────────────────────────────────────

export function UIPlaygroundClient() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--pb)', padding: '28px 20px 80px', maxWidth: 600, margin: '0 auto', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: 44 }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--pm2)', margin: '0 0 6px' }}>
          PATTO · DEV ONLY
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--pt)', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
          UI Design System
        </h1>
        <p style={{ fontSize: 13, color: 'var(--pm)', margin: 0, lineHeight: 1.6 }}>
          Reference screen for every dialog, button, and token. Check this before adding any new UI component.
        </p>
      </div>

      {/* ── 1. Dialogs ────────────────────────────────── */}
      <Section title="Dialogs">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>

          <DialogTrigger
            label="Install PATTO on iPhone"
            desc="Information"
            title="Install PATTO on iPhone"
            description="Add PATTO to your Home Screen for faster access."
            actions={[{ label: 'Got it', onClick: () => {}, variant: 'text' }]}
          />

          <DialogTrigger
            label="Delete Essay"
            desc="Confirm · Danger"
            title="Delete Essay?"
            description="This action cannot be undone."
            actions={[
              { label: 'Cancel', onClick: () => {}, variant: 'secondary' },
              { label: 'Delete', onClick: () => {}, variant: 'danger' },
            ]}
          />

          <DialogTrigger
            label="Add to Home Screen"
            desc="Confirm · Primary"
            title="Add PATTO to Home Screen"
            description="Install PATTO for faster access and continue learning like an app."
            actions={[
              { label: 'Install', onClick: () => {}, variant: 'primary' },
              { label: 'Not now', onClick: () => {}, variant: 'secondary' },
            ]}
          />

          <DialogTrigger
            label="Essay Saved"
            desc="Success"
            title="Essay saved successfully."
            actions={[{ label: 'OK', onClick: () => {}, variant: 'text' }]}
          />

          <DialogTrigger
            label="Network Error"
            desc="Error"
            title="Network Error"
            description="Please check your connection and try again."
            actions={[
              { label: 'Cancel', onClick: () => {}, variant: 'secondary' },
              { label: 'Retry', onClick: () => {}, variant: 'primary' },
            ]}
          />

          <DialogTrigger
            label="Review Complete"
            desc="Action"
            title="Review completed."
            actions={[{ label: 'View Result', onClick: () => {}, variant: 'primary' }]}
          />

          <DialogTrigger
            label="Sign Out"
            desc="Confirm"
            title="Sign out?"
            actions={[
              { label: 'Cancel', onClick: () => {}, variant: 'secondary' },
              { label: 'Sign out', onClick: () => {}, variant: 'danger' },
            ]}
          />

          <DialogTrigger
            label="Delete Account"
            desc="Danger"
            title="Delete your account?"
            description="This action cannot be undone. All data will be permanently removed."
            actions={[
              { label: 'Cancel', onClick: () => {}, variant: 'secondary' },
              { label: 'Delete', onClick: () => {}, variant: 'danger' },
            ]}
          />

          <DialogTrigger
            label="Install Guide (iOS)"
            desc="Guide sheet"
            title="Install PATTO on iPhone"
            hint={
              <p style={{ fontSize: 12.5, color: '#5856D6', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                Open this page in Safari to add it to your Home Screen.
              </p>
            }
            actions={[{ label: 'Got it', onClick: () => {}, variant: 'text' }]}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 14, paddingBottom: 4 }}>
              {['Tap the Share button (□↑) at the bottom of Safari.', 'Select "Add to Home Screen" from the menu.', 'Tap "Add" in the top right to finish.'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 13.5, color: 'var(--pt)', flexShrink: 0, lineHeight: 1.55 }}>{i + 1}.</span>
                  <p style={{ fontSize: 13.5, color: 'var(--pt)', margin: 0, lineHeight: 1.55 }}>{s}</p>
                </div>
              ))}
            </div>
          </DialogTrigger>

          <DialogTrigger
            label="Delete (Swipe)"
            desc="Confirm · Danger"
            title="Delete this?"
            description="This action cannot be undone."
            actions={[
              { label: 'Cancel', onClick: () => {}, variant: 'secondary' },
              { label: 'Delete', onClick: () => {}, variant: 'danger' },
            ]}
          />

        </div>
      </Section>

      {/* ── 2. Toast ──────────────────────────────────── */}
      <Section title="Toast">
        <ToastDemo />
      </Section>

      {/* ── 3. Buttons ────────────────────────────────── */}
      <Section title="Buttons">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            { label: 'Primary', btns: [{ label: 'Install', v: 'primary' }, { label: 'Save', v: 'primary' }, { label: 'Continue', v: 'primary' }] },
            { label: 'Secondary', btns: [{ label: 'Cancel', v: 'secondary' }, { label: 'Not now', v: 'secondary' }] },
            { label: 'Danger', btns: [{ label: 'Delete', v: 'danger' }, { label: 'Remove', v: 'danger' }] },
            { label: 'Text', btns: [{ label: 'Got it', v: 'text' }, { label: 'OK', v: 'text' }] },
            { label: 'Disabled', btns: [{ label: 'Install', v: 'primary', disabled: true }, { label: 'Cancel', v: 'secondary', disabled: true }] },
          ].map(g => (
            <div key={g.label}>
              <Label>{g.label}</Label>
              <Row>
                {g.btns.map((b, i) => (
                  <Btn key={i} label={b.label} variant={b.v} disabled={'disabled' in b} />
                ))}
              </Row>
            </div>
          ))}
          <div>
            <Label>Loading</Label>
            <Btn label="" loading />
          </div>
        </div>
      </Section>

      {/* ── 4. Typography ─────────────────────────────── */}
      <Section title="Typography">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Display',  size: 32, weight: 900, ls: '-0.03em' },
            { label: 'Title',    size: 22, weight: 800, ls: '-0.02em' },
            { label: 'Headline', size: 17, weight: 700, ls: '-0.01em' },
            { label: 'Body',     size: 15, weight: 400, ls: '0' },
            { label: 'Caption',  size: 12.5, weight: 400, ls: '0' },
            { label: 'Label',    size: 10, weight: 700, ls: '0.12em' },
            { label: 'Button',   size: 14, weight: 700, ls: '0' },
          ].map(t => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--pm2)', letterSpacing: '0.1em', textTransform: 'uppercase', width: 64, flexShrink: 0 }}>{t.label}</span>
              <span style={{ fontSize: t.size, fontWeight: t.weight, color: 'var(--pt)', letterSpacing: t.ls, lineHeight: 1.2 }}>
                The quick brown fox
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 5. Color Tokens ───────────────────────────── */}
      <Section title="Color Tokens">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          <ColorSwatch label="Accent  --pa" color="var(--pa)" />
          <ColorSwatch label="Danger" color={BURGUNDY} />
          <ColorSwatch label="Success" color="#34C759" />
          <ColorSwatch label="Warning" color="#FF9500" />
          <ColorSwatch label="Text  --pt" color="var(--pt)" />
          <ColorSwatch label="Muted  --pm" color="var(--pm)" />
          <ColorSwatch label="Glass  --pglass" color="var(--pglass)" />
          <ColorSwatch label="Background  --pb" color="var(--pb)" />
        </div>
      </Section>

      {/* ── 6. Spacing Scale ──────────────────────────── */}
      <Section title="Spacing Scale">
        <div style={{ columns: 2, columnGap: 40 }}>
          {[8, 12, 16, 20, 24, 28, 32, 40, 48].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: s, height: s, background: 'var(--pa)', borderRadius: 4, opacity: 0.5, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--pt)' }}>{s}px</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 7. Border Radius ──────────────────────────── */}
      <Section title="Border Radius">
        <Row gap={14} wrap>
          {[8, 12, 14, 16, 20, 24, 28, 32].map(r => (
            <div key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 48, height: 48, background: 'var(--pa)', borderRadius: r, opacity: 0.6 }} />
              <span style={{ fontSize: 10, color: 'var(--pm)' }}>{r}px</span>
            </div>
          ))}
        </Row>
      </Section>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
