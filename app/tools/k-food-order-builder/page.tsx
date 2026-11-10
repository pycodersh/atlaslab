import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { ToolFaq, type FaqItem } from '../ToolFaq'
import { OrderBuilder } from './OrderBuilder'

const URL = 'https://www.atlaslabstudios.com/tools/k-food-order-builder'
const TITLE = 'K-Food Order Builder | Polite Korean Phrases for 28 Popular Dishes'
const DESCRIPTION = 'Build accurate, polite Korean phrases for 28 iconic dishes. Adjust spice levels, dietary preferences, and show the flashcard directly to restaurant staff.'

const FAQ: FaqItem[] = [
  { q: 'How do I order food politely in Korean?', a: 'Add 주세요 (juseyo, “please give me”) after the dish and quantity. The builder puts the dish, number and requests together in the right order for you.' },
  { q: 'How do I ask for food that is not spicy?', a: 'Say 안 맵게 해 주세요 (an maepge hae juseyo) for not spicy, or 덜 맵게 해 주세요 (deol maepge hae juseyo) for less spicy.' },
  { q: 'Can the phrases guarantee an allergy-safe dish?', a: 'No. The phrases tell staff what you need, but they cannot guarantee a dish is free of traces or cross-contamination.' },
]

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: URL },
}

export default function Page() {
  return (
    <div className="tl-wrap">
      <p className="tl-eyebrow">Smart Travel Tools</p>
      <h1 className="tl-h1">Korean Restaurant Ordering Phrase Builder</h1>
      <p className="tl-lead">Pick your dishes and requests, then show the Korean to the staff.</p>
      <OrderBuilder />
      <ToolFaq items={FAQ} />
      <MoreTools current="/tools/k-food-order-builder" />
    </div>
  )
}
