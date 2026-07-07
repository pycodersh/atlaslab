/**
 * Annotation subType inference for legacy reviews that were saved before
 * subType was added to the schema.
 *
 * Uses only locally-available data (fragment, replacement, note) — zero API calls.
 * Confidence order: note text > fragment/replacement pattern > fallback undefined.
 */
import type { Annotation, AnnotationSubType } from './storage'

// ── Lookup tables ─────────────────────────────────────────────────────────────

const ARTICLES = new Set(['a', 'an', 'the'])

const PREPOSITIONS = new Set([
  'in','on','at','by','for','with','about','against','between',
  'into','through','during','before','after','above','below',
  'to','from','up','down','out','off','over','under','of','onto',
  'beside','besides','despite','except','without','within','toward',
  'towards','upon','along','across','behind','beyond','near','inside',
  'outside','since','until','till',
])

const IRREGULAR_PAIRS = new Map<string, string>([
  ['go','went'],['went','gone'],['am','was'],['is','was'],['are','were'],
  ['was','were'],['have','had'],['has','had'],['do','did'],['come','came'],
  ['get','got'],['make','made'],['take','took'],['see','saw'],['know','knew'],
  ['think','thought'],['feel','felt'],['meet','met'],['run','ran'],
  ['give','gave'],['find','found'],['tell','told'],['become','became'],
  ['begin','began'],['keep','kept'],['hold','held'],['write','wrote'],
  ['stand','stood'],['hear','heard'],['speak','spoke'],['spend','spent'],
  ['bring','brought'],['buy','bought'],['catch','caught'],['teach','taught'],
  ['leave','left'],['lose','lost'],['win','won'],['pay','paid'],
  ['say','said'],['send','sent'],['sit','sat'],['eat','ate'],
  ['drink','drank'],['drive','drove'],['fly','flew'],['grow','grew'],
  ['ride','rode'],['rise','rose'],['sing','sang'],['swim','swam'],
  ['throw','threw'],['wear','wore'],['wake','woke'],['break','broke'],
  ['choose','chose'],['draw','drew'],['fall','fell'],['forget','forgot'],
  ['forgive','forgave'],['hide','hid'],['hit','hit'],['hurt','hurt'],
  ['lay','laid'],['lead','led'],['lend','lent'],['lie','lay'],
  ['mean','meant'],['meet','met'],['prove','proved'],['quit','quit'],
  ['read','read'],['set','set'],['show','showed'],['shut','shut'],
  ['sleep','slept'],['slide','slid'],['spread','spread'],['steal','stole'],
  ['strike','struck'],['swear','swore'],['sweep','swept'],['swing','swung'],
  ['understand','understood'],['wake','woken'],['withdraw','withdrew'],
])

// ── Inference logic ───────────────────────────────────────────────────────────

export function inferSubType(ann: Annotation): AnnotationSubType | undefined {
  if (ann.type !== 'grammar') return undefined

  const note = (ann.note ?? '').toLowerCase()
  const frag = (ann.fragment ?? '').toLowerCase().trim()
  const repl = (ann.replacement ?? '').toLowerCase().trim()
  const fragW = frag.split(/\s+/)
  const replW = repl.split(/\s+/)
  const f0 = fragW[0]   // first word of fragment
  const r0 = replW[0]   // first word of replacement

  // ── 1. Note-based (highest confidence) ─────────────────────────────────────

  if (/\btense\b|past tense|present tense|future tense|past perfect|present perfect|past\./.test(note))
    return 'tense'
  if (/\bagreement\b|subject.verb|subject-verb/.test(note))
    return 'agreement'
  if (/\bverb.?form\b|infinitive|gerund|participle/.test(note))
    return 'verbForm'
  if (/\barticle\b|use ['"`]a['"`]|use ['"`]an['"`]|use ['"`]the['"`]|missing article/.test(note))
    return 'article'
  if (/\bpreposition\b/.test(note))
    return 'preposition'
  if (/\bmissing\b/.test(note))
    return 'missing'
  if (/\bspelling\b/.test(note))
    return 'spelling'
  if (/\bcapital|capitaliz|uppercase/.test(note))
    return 'capitalization'
  if (/\bword order\b|reorder/.test(note))
    return 'wordOrder'
  if (/\bpunctuation\b|comma\b|apostrophe/.test(note))
    return 'punctuation'
  if (/typical|typ\./i.test(ann.note ?? ''))
    return 'capitalization'  // typical is usually capitalization

  // ── 2. Fragment/replacement pattern analysis ────────────────────────────────

  // Article: fragment or replacement is purely an article
  if (ARTICLES.has(frag) || ARTICLES.has(repl)) return 'article'
  if (ARTICLES.has(f0) && replW.length === 1 && ARTICLES.has(r0)) return 'article'

  // Preposition: single word that is a preposition
  if (!frag.includes(' ') && !repl.includes(' ')) {
    if (PREPOSITIONS.has(frag) && repl) return 'preposition'
    if (PREPOSITIONS.has(repl) && frag) return 'preposition'
  }
  if (PREPOSITIONS.has(f0) && PREPOSITIONS.has(r0)) return 'preposition'

  // Tense: irregular verb pairs (both directions)
  if (frag && repl) {
    const irrMatch = IRREGULAR_PAIRS.get(frag) === repl || IRREGULAR_PAIRS.get(repl) === frag
    if (irrMatch) return 'tense'
    // Regular past tense: add/remove -ed
    if (!frag.includes(' ') && !repl.includes(' ')) {
      if (frag + 'ed' === repl || repl + 'ed' === frag) return 'tense'
      if (frag + 'd' === repl  || repl + 'd' === frag)  return 'tense'
      // -s agreement: lives ↔ live, has ↔ have
      if (frag + 's' === repl  || repl + 's' === frag)  return 'agreement'
      if (frag + 'es' === repl || repl + 'es' === frag) return 'agreement'
    }
  }

  // Multi-word replacement for single-word fragment → likely tense improvement
  if (!frag.includes(' ') && repl.includes(' ') && repl.split(' ').length <= 4) return 'tense'

  // Single word → single word with replacement → vocabulary
  if (frag && repl && !frag.includes(' ') && !repl.includes(' ')) return 'vocabulary'

  return undefined  // unknown — renderer will use legacy fallback
}

// ── Batch migration ───────────────────────────────────────────────────────────

export function migrateAnnotations(
  annotations: Annotation[]
): { annotations: Annotation[]; changed: boolean } {
  let changed = false
  const result = annotations.map(ann => {
    if (ann.subType) return ann       // already tagged — skip
    const inferred = inferSubType(ann)
    if (inferred) {
      changed = true
      return { ...ann, subType: inferred }
    }
    return ann
  })
  return { annotations: result, changed }
}
