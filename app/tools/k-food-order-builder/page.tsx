import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolAbout } from '../ToolAbout'
import { OrderBuilder } from './OrderBuilder'

const URL = 'https://www.atlaslabstudios.com/tools/k-food-order-builder'
const TITLE = 'K-Food Order Builder | Polite Korean Phrases for 28 Popular Dishes'
const DESCRIPTION = 'Build accurate, polite Korean phrases for 28 iconic dishes. Adjust spice levels, dietary preferences, and show the flashcard directly to restaurant staff.'

// About this tool — 예전 FAQ 의 핵심을 2~3문장으로. 참고 문구(기준일 · 확인 안내 · 출처)는 위젯 밑에서 옮겨 왔다
const ABOUT = "Tap the dishes you want, set how many, then add a spice level and requests like no cilantro or a peanut allergy. The builder puts it all into polite Korean in the right order, ending each line with 주세요 (juseyo, “please”), so you can tap Show to staff or copy the Korean. For a mild meal, 안 맵게 해 주세요 (an maepge hae juseyo) means “not spicy, please.”"
const NOTE = (
  <>Note: The phrases tell staff what you need, but they can’t guarantee a dish is free of traces or cross-contamination. With a severe allergy, confirm with staff and carry your medication.</>
)

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
      <ToolAbout text={ABOUT} note={NOTE} />
      <WidgetActionChips tool="order-builder" />
      <MoreTools current="/tools/k-food-order-builder" />
    </div>
  )
}
