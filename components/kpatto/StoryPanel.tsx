'use client'

import type { KPattoPanel, KPattoPattern, KPattoLanguage } from '@/data/kpatto/types'
import { SpeechBubbleLayer } from './SpeechBubble'
import { DialogueBubble } from './DialogueBubble'
import { PatternInsertCard } from './PatternInsertCard'

interface StoryPanelProps {
  panel: KPattoPanel
  panelIndex: number
  patterns: Record<string, KPattoPattern>
  displayLang: KPattoLanguage
}

// Placeholder shown when no image is available
function PanelPlaceholder({ panelIndex }: { panelIndex: number }) {
  return (
    <div style={{
      width: '100%',
      aspectRatio: '720/220',
      background: 'linear-gradient(160deg, #e8eeff 0%, #d4dcff 100%)',
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#8899cc',
      fontSize: 13,
      fontWeight: 500,
      gap: 8,
      border: '1px dashed #c0caee',
    }}>
      <span style={{ fontSize: 32 }}>🎨</span>
      <span>Cut {panelIndex + 1}</span>
    </div>
  )
}

// Strip image cropped to the correct panel via CSS
function StripPanel({ stripUrl, stripIndex, aspect, alt }: {
  stripUrl: string
  stripIndex: number
  aspect: string
  alt: string
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: aspect,
        overflow: 'hidden',
        borderRadius: 12,
        background: '#111',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={stripUrl}
        alt={alt}
        style={{
          position: 'absolute',
          width: '100%',
          height: 'auto',
          top: `${-stripIndex * 100}%`,
          display: 'block',
        }}
      />
    </div>
  )
}

// Translation line shown below the panel (instead of Korean dialogue)
function TranslationRow({ character, translation }: { character: string; translation: string }) {
  return (
    <div style={{ fontSize: 12.5, color: 'var(--pm)', lineHeight: 1.5, marginBottom: 3 }}>
      <span style={{ color: 'var(--pt)', fontWeight: 600 }}>{character}: </span>
      {translation}
    </div>
  )
}

export function StoryPanel({ panel, panelIndex, patterns, displayLang }: StoryPanelProps) {
  const aspect = panel.panel_aspect ?? '720/220'
  const hasStrip = !!panel.strip_url
  const hasBubbles = !!(panel.speech_bubbles && panel.speech_bubbles.length > 0)

  return (
    <div style={{ marginBottom: 36 }}>
      {/* ── Panel image ──────────────────────────────────────────────── */}
      <div style={{ padding: '0 16px', marginBottom: hasBubbles ? 10 : 16 }}>
        {hasStrip ? (
          <div style={{ position: 'relative' }}>
            <StripPanel
              stripUrl={panel.strip_url!}
              stripIndex={panel.strip_index ?? 0}
              aspect={aspect}
              alt={`컷 ${panelIndex + 1}`}
            />
            {hasBubbles && (
              // Absolute within the strip container — must overlay exactly
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <SpeechBubbleLayer bubbles={panel.speech_bubbles!} />
              </div>
            )}
          </div>
        ) : panel.image_url ? (
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={panel.image_url}
              alt={`컷 ${panelIndex + 1}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            {hasBubbles && (
              <div style={{ position: 'absolute', inset: 0 }}>
                <SpeechBubbleLayer bubbles={panel.speech_bubbles!} />
              </div>
            )}
          </div>
        ) : (
          <PanelPlaceholder panelIndex={panelIndex} />
        )}
      </div>

      {/* ── Translation (speech-bubble mode) ────────────────────────── */}
      {hasBubbles && panel.dialogues.length > 0 && displayLang !== 'ko' && (
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          {panel.dialogues.map(d => {
            const t = d.translations[displayLang]
            if (!t) return null
            return <TranslationRow key={d.id} character={d.character} translation={t} />
          })}
        </div>
      )}

      {/* ── Dialogue bubbles (fallback / no-image mode) ──────────────── */}
      {!hasBubbles && panel.dialogues.length > 0 && (
        <div style={{ padding: '0 12px' }}>
          {panel.dialogues.map((dialogue, i) => (
            <DialogueBubble
              key={dialogue.id}
              dialogue={dialogue}
              displayLang={displayLang}
              tailSide={i % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>
      )}

      {/* ── Pattern card ─────────────────────────────────────────────── */}
      {panel.pattern_card && patterns[panel.pattern_card.pattern_id] && (
        <div style={{ padding: '0 12px' }}>
          <PatternInsertCard
            pattern={patterns[panel.pattern_card.pattern_id]}
            displayLang={displayLang}
          />
        </div>
      )}
    </div>
  )
}
