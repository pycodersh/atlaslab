/**
 * Generates saveCandidates for all 500 story paragraphs.
 * Run: node scripts/generate-story-chunks.mjs
 * Output: data/story-chunks.ts
 */

import fs from 'fs'

// ─────────────────────────────────────────────────────────────────────────────
// Chunk dictionary: ordered by priority (highest first within same type)
// Each entry: { text, type }
// Matching is case-insensitive; offsets are recorded in original case.
// ─────────────────────────────────────────────────────────────────────────────

const PHRASAL_VERBS = [
  // 3-word phrasal verbs (match before 2-word)
  'looking forward to', 'looked forward to', 'look forward to',
  'looking up to', 'looked up to', 'look up to',
  'looking down on', 'looked down on', 'look down on',
  'coming up with', 'came up with', 'come up with',
  'putting up with', 'put up with',
  'getting rid of', 'got rid of', 'get rid of',
  'taking care of', 'took care of', 'take care of',
  'running out of', 'ran out of', 'run out of',
  'keeping up with', 'kept up with', 'keep up with',
  'catching up with', 'caught up with', 'catch up with',
  'making up for', 'made up for', 'make up for',
  'giving up on', 'gave up on', 'give up on',
  'holding on to', 'held on to', 'hold on to',
  'living up to', 'lived up to', 'live up to',
  'standing up for', 'stood up for', 'stand up for',
  'going along with', 'went along with', 'go along with',
  'getting along with', 'got along with', 'get along with',
  'ended up with', 'ends up with', 'end up with',
  'dealing with', 'dealt with', 'deal with',
  // 2-word phrasal verbs — base + past + -ing
  'giving up', 'gave up', 'given up', 'give up',
  'picking up', 'picked up', 'pick up',
  'putting on', 'put on',
  'taking off', 'took off', 'take off',
  'turning on', 'turned on', 'turn on',
  'turning off', 'turned off', 'turn off',
  'turning up', 'turned up', 'turn up',
  'turning down', 'turned down', 'turn down',
  'looking up', 'looked up', 'look up',
  'looking back', 'looked back', 'look back',
  'looking around', 'looked around', 'look around',
  'finding out', 'found out', 'find out',
  'figuring out', 'figured out', 'figure out',
  'working out', 'worked out', 'work out',
  'coming out', 'came out', 'come out',
  'going out', 'went out', 'go out',
  'getting out', 'got out', 'get out',
  'sitting down', 'sat down', 'sit down',
  'standing up', 'stood up', 'stand up',
  'showing up', 'showed up', 'show up',
  'waking up', 'woke up', 'wake up',
  'getting up', 'got up', 'get up',
  'setting up', 'set up',
  'setting off', 'set off',
  'moving on', 'moved on', 'move on',
  'moving out', 'moved out', 'move out',
  'moving in', 'moved in', 'move in',
  'going back', 'went back', 'go back',
  'coming back', 'came back', 'come back',
  'getting back', 'got back', 'get back',
  'stepping back', 'stepped back', 'step back',
  'holding back', 'held back', 'hold back',
  'going on', 'went on', 'go on',
  'carrying on', 'carried on', 'carry on',
  'keeping on', 'kept on', 'keep on',
  'running into', 'ran into', 'run into',
  'bumping into', 'bumped into', 'bump into',
  'taking on', 'took on', 'take on',
  'taking out', 'took out', 'take out',
  'taking over', 'took over', 'take over',
  'taking place', 'took place', 'take place',
  'making sense', 'made sense', 'make sense',
  'making sure', 'made sure', 'make sure',
  'feeling like', 'felt like', 'feel like',
  'seeming like', 'seemed like', 'seem like',
  'looking like', 'looked like', 'look like',
  'sounding like', 'sounded like', 'sound like',
  'getting used to', 'got used to', 'get used to',
  'used to',
  'trying out', 'tried out', 'try out',
  'starting over', 'started over', 'start over',
  'ending up', 'ended up', 'end up',
  'growing up', 'grew up', 'grow up',
  'slowing down', 'slowed down', 'slow down',
  'calming down', 'calmed down', 'calm down',
  'breaking down', 'broke down', 'break down',
  'breaking up', 'broke up', 'break up',
  'building up', 'built up', 'build up',
  'reaching out', 'reached out', 'reach out',
  'working on', 'worked on', 'work on',
  'checking in', 'checked in', 'check in',
  'checking out', 'checked out', 'check out',
  'signing up', 'signed up', 'sign up',
  'falling asleep', 'fell asleep', 'fall asleep',
  'falling apart', 'fell apart', 'fall apart',
  'falling behind', 'fell behind', 'fall behind',
  'falling in love', 'fell in love', 'fall in love',
  'bringing up', 'brought up', 'bring up',
  'bringing back', 'brought back', 'bring back',
  'cutting off', 'cut off',
  'leaving out', 'left out', 'leave out',
  'leaving behind', 'left behind', 'leave behind',
  'putting off', 'put off',
  'putting down', 'put down',
  'putting away', 'put away',
  'thinking about', 'thought about', 'think about',
  'caring about', 'cared about', 'care about',
  'worrying about', 'worried about', 'worry about',
  'talking about', 'talked about', 'talk about',
  'hearing about', 'heard about', 'hear about',
  'learning about', 'learned about', 'learn about',
  'going through', 'went through', 'go through',
  'getting through', 'got through', 'get through',
  'looking through', 'looked through', 'look through',
  'waiting for', 'waited for', 'wait for',
  'asking for', 'asked for', 'ask for',
  'looking for', 'looked for', 'look for',
  'hoping for', 'hoped for', 'hope for',
  'listening to', 'listened to', 'listen to',
  'talking to', 'talked to', 'talk to',
  'belonging to', 'belonged to', 'belong to',
  'leading to', 'led to', 'lead to',
  'depending on', 'depended on', 'depend on',
  'focusing on', 'focused on', 'focus on',
  'counting on', 'counted on', 'count on',
  'relying on', 'relied on', 'rely on',
  'agreeing with', 'agreed with', 'agree with',
  'helping with', 'helped with', 'help with',
  'starting with', 'started with', 'start with',
  'beginning with', 'began with', 'begin with',
]

const PREP_PHRASES = [
  'as soon as', 'as long as', 'as much as', 'as well as', 'as far as',
  'as a result', 'as a matter of fact', 'as if', 'as though',
  'at the end of', 'at the beginning of', 'at the same time', 'at first',
  'at last', 'at least', 'at most', 'at once', 'at all',
  'in front of', 'in spite of', 'in the middle of', 'in addition to',
  'in order to', 'in case of', 'in fact', 'in general', 'in the end',
  'in the morning', 'in the afternoon', 'in the evening', 'in the night',
  'in the past', 'in the future', 'in the meantime', 'in a way',
  'for the first time', 'for a while', 'for a long time', 'for now',
  'for example', 'for instance', 'for sure', 'for good', 'for once',
  'on the way', 'on the other hand', 'on time', 'on purpose',
  'one by one', 'day by day', 'step by step', 'little by little',
  'more and more', 'less and less',
  'from now on', 'from time to time',
  'once in a while',
  'all of a sudden', 'all the time', 'all at once',
  'right away', 'right now', 'right here', 'right there',
  'no matter what', 'no matter how',
  'a lot of', 'a little bit', 'a few times',
  'so far', 'so much', 'so many',
  'even though', 'even if', 'even when',
  'instead of', 'because of', 'thanks to', 'due to',
  'on my own', 'on your own', 'on his own', 'on her own', 'on its own',
  'by myself', 'by yourself', 'by himself', 'by herself',
  'at the moment', 'at this point', 'at that point',
  'to be honest', 'to be fair', 'to be clear',
  'after all', 'above all', 'after a while',
  'next to', 'close to', 'far from', 'apart from',
  'by the window', 'by the door', 'by the end',
  'for a moment', 'for a second', 'for a minute',
  'in a moment', 'in a few minutes', 'in a hurry',
  'at the table', 'at the counter', 'at the door',
  'no wonder', 'no problem', 'no doubt',
  'on the phone', 'on the street', 'on the floor', 'on the wall',
  'out of nowhere', 'out of the way', 'out of habit',
  'in the back', 'in the front', 'in the corner', 'in the middle',
  'over and over', 'again and again',
  'back and forth',
  'all at once', 'all the same',
  'just in case', 'just in time',
  'at a time', 'one at a time',
  'a long time', 'a short time', 'a little time',
  'the best part', 'the hard part', 'the easy part',
  'the right thing', 'the wrong thing',
  'for a reason', 'for some reason',
  'in silence', 'in peace', 'in trouble',
]

const COLLOCATIONS = [
  // make + noun
  'made a decision', 'make a decision', 'make a choice', 'made a choice',
  'make a difference', 'made a difference',
  'make a mistake', 'made a mistake',
  'make a plan', 'made a plan', 'make a promise', 'made a promise',
  'make progress', 'made progress',
  'make friends', 'made friends',
  'make time', 'made time', 'make sure', 'made sure',
  // take + noun
  'took a break', 'take a break',
  'took a step', 'take a step',
  'took a walk', 'take a walk',
  'took a look', 'take a look',
  'took a chance', 'take a chance',
  'took a deep breath', 'take a deep breath',
  'took time', 'take time', 'took action', 'take action',
  'took notes', 'take notes', 'took care', 'take care', 'took turns', 'take turns',
  // have + noun
  'had a conversation', 'have a conversation',
  'had a chance', 'have a chance',
  'had a look', 'have a look',
  'had fun', 'have fun', 'had time', 'have time',
  'had a feeling', 'have a feeling',
  'had a problem', 'have a problem',
  'had a habit', 'have a habit',
  // get + adj
  'got better', 'get better', 'got worse', 'get worse',
  'got tired', 'get tired', 'got excited', 'get excited',
  'got ready', 'get ready', 'got nervous', 'get nervous',
  'got angry', 'get angry', 'got lost', 'get lost',
  'got home', 'get home', 'got started', 'get started',
  // keep + noun/adj
  'keep going', 'kept going', 'keep trying', 'kept trying',
  'keep quiet', 'kept quiet', 'keep in touch', 'kept in touch',
  'keep a journal', 'kept a journal',
  'keep a promise', 'kept a promise',
  'keep calm', 'kept calm',
  // do + noun
  'did research', 'do research',
  // feel + adj
  'felt better', 'feel better', 'felt worse', 'feel worse',
  'felt comfortable', 'feel comfortable',
  'felt confident', 'feel confident',
  'felt nervous', 'feel nervous',
  'felt happy', 'feel happy', 'felt tired', 'feel tired',
  'felt proud', 'feel proud', 'felt relieved', 'feel relieved',
  'felt calm', 'feel calm', 'felt safe', 'feel safe',
  // stay + adj
  'stayed positive', 'stay positive',
  'stayed focused', 'stay focused',
  'stayed calm', 'stay calm',
  'stayed quiet', 'stay quiet',
  'stayed warm', 'stay warm',
  // common adj+noun
  'hard work', 'good job', 'small steps', 'fresh start', 'deep breath',
  'strong feeling', 'quiet moment', 'right time', 'long time',
  'new start', 'good friend', 'best friend', 'old friend',
  'busy day', 'every day', 'every time', 'every night',
  'small kindness', 'simple task', 'warm smile', 'short break',
  'new place', 'new job', 'new beginning',
  // want / need / try + to
  'wanted to', 'want to', 'wants to',
  'needed to', 'need to', 'needs to',
  'tried to', 'try to', 'tries to',
  'decided to', 'decide to',
  'started to', 'start to',
  'began to', 'begin to',
  'managed to', 'manage to',
  'seemed to', 'seem to',
  'happened to', 'happen to',
  'tended to', 'tend to',
  'supposed to',
  'used to',
  'meant to',
  'had to', 'have to', 'has to',
  'ought to',
  // worth + -ing
  'worth trying', 'worth doing', 'worth it',
]

const CHUNKS = [
  // I + modal / aux
  "I'd like to", "I'd love to", "I'd rather", "I'd been",
  "I'm going to", "I'm trying to", "I'm thinking about", "I'm looking forward to",
  "I'm not sure", "I'm pretty sure", "I'm so glad", "I'm so excited",
  "I'm afraid", "I'm sorry", "I'm happy to", "I'm glad to",
  "I can't wait", "I can't believe", "I don't think", "I don't know",
  "I don't want to", "I don't have to",
  "I want to", "I wanted to", "I need to", "I needed to",
  "I hope to", "I hoped to", "I plan to", "I planned to",
  "I used to", "I was wondering", "I was thinking",
  "I couldn't help", "I couldn't believe",
  // It + be / seem
  "It seems like", "It felt like", "It feels like", "It looks like", "It sounded like",
  "It's been a long time", "It's been a while",
  "It was getting", "It was the best", "It was the first",
  "It turns out", "It turned out",
  // That's + ...
  "That's why", "That's because", "That's when", "That's how",
  "That's the thing", "That's what", "That's all",
  // Discourse markers
  "even so", "even then", "instead",
  "after that", "before that", "since then",
  "not only", "not just", "not yet",
  "at least", "at last", "at the time",
  "in the end", "in the meantime",
  // be + adj + prep
  "interested in", "excited about", "worried about",
  "proud of", "afraid of", "tired of",
  "good at", "bad at", "ready for",
  "happy with", "pleased with", "satisfied with",
  "surprised by", "impressed by",
  "used to", "supposed to",
  // common fixed
  "no wonder", "no problem", "no doubt",
  "the same", "the only", "the first time",
  "for a moment", "after a while", "all of a sudden",
  "by the time", "every time", "one day",
  "just to", "just in", "just for",
  "can't help", "can't wait", "can't believe",
  "don't have to", "doesn't have to",
]

// ─────────────────────────────────────────────────────────────────────────────
// Matching engine
// ─────────────────────────────────────────────────────────────────────────────

function findCandidates(sentence) {
  const lower = sentence.toLowerCase()
  const results = []

  function search(list, type) {
    for (const phrase of list) {
      const pl = phrase.toLowerCase()
      let idx = 0
      while (true) {
        const pos = lower.indexOf(pl, idx)
        if (pos === -1) break
        // Ensure word boundary at start
        const before = pos === 0 ? '' : lower[pos - 1]
        const after = pos + pl.length >= lower.length ? '' : lower[pos + pl.length]
        const startOk = pos === 0 || !/[a-z0-9']/i.test(before)
        const endOk = pos + pl.length >= lower.length || !/[a-z0-9]/i.test(after)
        if (startOk && endOk) {
          results.push({ text: sentence.slice(pos, pos + pl.length), type, start: pos, end: pos + pl.length })
        }
        idx = pos + 1
      }
    }
  }

  search(PHRASAL_VERBS, 'phrasalVerb')
  search(PREP_PHRASES, 'prepPhrase')
  search(COLLOCATIONS, 'collocation')
  search(CHUNKS, 'chunk')

  // Deduplicate: for overlapping matches, keep highest-priority
  const priority = { phrasalVerb: 5, idiom: 4, fixedExpression: 3, collocation: 2, chunk: 1, prepPhrase: 1 }
  results.sort((a, b) => {
    const pd = (priority[b.type] || 0) - (priority[a.type] || 0)
    if (pd !== 0) return pd
    return (b.end - b.start) - (a.end - a.start)  // longer first
  })

  const kept = []
  for (const r of results) {
    // Skip if already covered by a higher-priority match
    const overlaps = kept.some(k => r.start < k.end && r.end > k.start && k.type === r.type)
    if (!overlaps) kept.push(r)
  }

  return kept.sort((a, b) => a.start - b.start)
}

// ─────────────────────────────────────────────────────────────────────────────
// Extract sentences from magazine-stories.ts
// ─────────────────────────────────────────────────────────────────────────────

const src = fs.readFileSync('./data/magazine-stories.ts', 'utf8')

// Extract paragraph id and english pairs
const paraRegex = /id:\s*'(p\d+-\d+)',\s*\n\s*english:\s*`([^`]*)`|id:\s*'(p\d+-\d+)',\s*\n\s*english:\s*"([^"]*)"/g
const dqRegex = /\{\s*id:\s*'(p\d+-\d+)'[^}]*?english:\s*"((?:[^"\\]|\\.)*)"/gs
const sqRegex = /\{\s*id:\s*'(p\d+-\d+)'[^}]*?english:\s*`((?:[^`\\]|\\.)*)`/gs

const paragraphs = []

// Parse whole file: match id then find nearest english within 800 chars
// Handles both double-quoted and single-quoted english strings
const idRe = /id:\s*'(p\d+-\d+)'/g
let m
while ((m = idRe.exec(src)) !== null) {
  const id = m[1]
  const after = src.slice(m.index, m.index + 800)
  // double-quoted: english: "..."
  const dqM = after.match(/english:\s*"([^]*?)",\s*[\n\s]*korean/)
  // single-quoted: english: '...'
  const sqM = after.match(/english:\s*'([^]*?)',\s*[\n\s]*korean/)
  const raw = dqM ? dqM[1] : sqM ? sqM[1] : null
  if (raw) {
    const english = raw
      .replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, ' ').trim()
    paragraphs.push({ id, english })
  }
}

console.log(`Found ${paragraphs.length} paragraphs`)

// ─────────────────────────────────────────────────────────────────────────────
// Generate candidates
// ─────────────────────────────────────────────────────────────────────────────

const errors = []
const results = {}

for (const { id, english } of paragraphs) {
  const candidates = findCandidates(english)

  // Validate offsets
  const invalid = candidates.filter(c => english.slice(c.start, c.end).toLowerCase() !== c.text.toLowerCase())
  if (invalid.length > 0) {
    errors.push({ id, invalid })
  }

  if (candidates.length > 0) {
    results[id] = candidates
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────────────────────────────────────

const totalParagraphs = paragraphs.length
const coveredParagraphs = Object.keys(results).length
const uncovered = paragraphs.filter(p => !results[p.id]).map(p => p.id)

console.log(`\n=== RESULTS ===`)
console.log(`Total paragraphs: ${totalParagraphs}`)
console.log(`With chunks: ${coveredParagraphs}`)
console.log(`Without chunks: ${uncovered.length}`)
if (uncovered.length > 0) {
  console.log(`\nNo-chunk paragraph IDs: ${uncovered.join(', ')}`)
}
if (errors.length > 0) {
  console.log(`\nOffset errors:`)
  errors.forEach(e => console.log(`  ${e.id}:`, e.invalid))
}

// Generate TypeScript file
let out = `import type { SaveCandidate } from '@/data/pattern-examples-full'

/**
 * Story paragraph saveCandidates — auto-generated by scripts/generate-story-chunks.mjs
 * ${coveredParagraphs} / ${totalParagraphs} paragraphs have chunk data.
 */
export const storyChunks: Record<string, SaveCandidate[]> = {
`

for (const [id, candidates] of Object.entries(results)) {
  out += `  '${id}': [\n`
  for (const c of candidates) {
    out += `    { text: ${JSON.stringify(c.text)}, type: '${c.type}', start: ${c.start}, end: ${c.end} },\n`
  }
  out += `  ],\n`
}

out += `}\n`

fs.writeFileSync('./data/story-chunks.ts', out)
console.log(`\nWrote data/story-chunks.ts`)

// Write report
const report = {
  totalParagraphs,
  coveredParagraphs,
  uncoveredParagraphs: uncovered.length,
  uncoveredIds: uncovered,
  offsetErrors: errors,
}
fs.writeFileSync('./scripts/chunk-report.json', JSON.stringify(report, null, 2))
console.log(`Wrote scripts/chunk-report.json`)
