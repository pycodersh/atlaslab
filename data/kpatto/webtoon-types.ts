// Webtoon-style episode data types
// Used for full webtoon vertical scroll layout (gap + panel alternating structure)

export interface WebtoonBubble {
  id: string
  bubbleKey: string     // key in bubbles.json, e.g. "bubble-02-oval-bottom-center"
  xPct: number          // left position as % of container width
  yPct: number          // top position as % of gap height
  widthPct: number      // width as % of container width
  rotation?: number     // rotation in degrees
  flip?: boolean        // horizontal flip (scaleX(-1))
  korean: string        // Korean dialogue text (may include \n)
  translation: string   // English translation
  speaker: string       // character name (lowercase) e.g. "emma"
  lines?: 1 | 2 | 3    // hint for font size
}

export interface WebtoonGapSection {
  type: 'gap'
  id: string
  heightRatio: number   // gap height / 430 — used as padding-bottom % to scale with width
  bubbles: WebtoonBubble[]
}

export interface WebtoonPanelSection {
  type: 'panel'
  id: string
  imageUrl: string
  layout: 'wide' | 'medium-right' | 'medium-left'
}

export type WebtoonSection = WebtoonGapSection | WebtoonPanelSection

export interface WebtoonEpisodeData {
  id: string
  episode: number
  title: string
  theme: string
  sections: WebtoonSection[]
}
