// Webtoon-style episode data types
// Used for full webtoon vertical scroll layout (gap + panel alternating structure)

/** Dynamic tail data for body-only bubble types (bubble-oval, bubble-wide, etc.) */
export interface BubbleTailData {
  /** Position on the oval perimeter (0=right, 0.25=bottom, 0.5=left, 0.75=top) */
  anchor: number
  /** Tail tip X, normalized by bubble width (can be outside 0–1) */
  tipX: number
  /** Tail tip Y, normalized by bubble height (can be outside 0–1) */
  tipY: number
  /** Width of tail base where it meets the body, normalized by bubble width */
  baseWidth: number
}

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
  tail?: BubbleTailData // if present, renders dynamic tail (body-only bubble keys)
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

/**
 * Single-image CSS-crop panel. All panels in an episode share one source image.
 * Crop values are natural pixel coordinates of the source image.
 *
 * CSS formulae (containerWidth = 100%):
 *   imgWidth  = (srcW / cropW) × 100%
 *   imgLeft   = -(cropX / cropW) × 100%
 *   imgTop    = -(cropY / cropW) × 100%   ← NOT cropH; aspect is handled by imgWidth
 *   pb        = (cropH / cropW) × 100%
 */
export interface WebtoonCropSection {
  type: 'crop-panel'
  id: string
  imageUrl: string
  srcW: number   // natural width of source image in px
  cropX: number  // left edge of crop region in px
  cropY: number  // top edge of crop region in px
  cropW: number  // width of crop region in px
  cropH: number  // height of crop region in px
}

export type WebtoonSection = WebtoonGapSection | WebtoonPanelSection | WebtoonCropSection

export interface WebtoonEpisodeData {
  id: string
  episode: number
  title: string
  theme: string
  sections: WebtoonSection[]
}
