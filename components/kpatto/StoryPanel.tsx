'use client'

import Image from 'next/image'
import type { KPattoPanel, KPattoPattern, KPattoLanguage } from '@/data/kpatto/types'
import { DialogueBubble } from './DialogueBubble'
import { PatternInsertCard } from './PatternInsertCard'

interface StoryPanelProps {
  panel: KPattoPanel
  panelIndex: number
  patterns: Record<string, KPattoPattern>
  displayLang: KPattoLanguage
}

// Placeholder image when no webtoon asset is available
function PanelPlaceholder({ panelIndex }: { panelIndex: number }) {
  return (
    <div style={{
      width: '100%',
      aspectRatio: '3/4',
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
      <span>컷 {panelIndex + 1} — 웹툰 이미지</span>
    </div>
  )
}

export function StoryPanel({ panel, panelIndex, patterns, displayLang }: StoryPanelProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Webtoon image — centered with horizontal margins */}
      <div style={{ padding: '0 16px', marginBottom: 16 }}>
        {panel.image_url ? (
          <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
            <Image
              src={panel.image_url}
              alt={`컷 ${panelIndex + 1}`}
              width={600}
              height={800}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        ) : (
          <PanelPlaceholder panelIndex={panelIndex} />
        )}
      </div>

      {/* Dialogues — extend to full width with generous side padding */}
      {panel.dialogues.length > 0 && (
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

      {/* Pattern card slot — between panels */}
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
