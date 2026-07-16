/**
 * Focus Mode typography tokens.
 * Single source of truth for font sizes, weights, and colors used in FocusMode.
 */

export const focusTypo = {
  // Pattern keyword (패턴 표현)
  pattern: {
    fontSize:    42,
    fontWeight:  700,
    color:       '#5C72B0',   // Primary Blue
    lineHeight:  1.25,
  },
  // English body — story paragraph + pattern example (공통)
  bodyEn: {
    fontSize:    34,
    fontWeight:  600,
    color:       '#1A1F36',   // Primary Text
    lineHeight:  1.6,
    letterSpacing: '-0.3px',
  },
  // Korean translation — story + example (공통)
  bodyKo: {
    fontSize:    22,
    fontWeight:  500,
    color:       'rgba(80,100,160,0.55)',  // Secondary Text
    lineHeight:  1.6,
  },
  // Descriptive labels (meaning, tap hint, etc.)
  desc: {
    fontSize:    18,
    fontWeight:  400,
    color:       'rgba(80,100,160,0.5)',
    lineHeight:  1.5,
  },
  // Top UI (phase label, lang switcher labels)
  ui: {
    fontSize:    16,
    fontWeight:  500,
    color:       'rgba(80,100,160,0.6)',
    letterSpacing: '0.01em',
  },
} as const
