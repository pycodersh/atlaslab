import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolAbout } from '../ToolAbout'
import { KoreaUnitsModal } from './KoreaUnitsModal'

const URL = 'https://www.atlaslabstudios.com/tools/korea-size-converter'
const TITLE = 'Korea Clothing & Shoe Size Converter (mm to US/EU) | Pyeong to Sqm'
const DESCRIPTION = 'Convert Korean shoe sizes (mm), clothing tags, K-BBQ meat portions in grams, and hotel/apartment room sizes in Pyeong.'

// About this tool — 예전 FAQ 의 핵심을 2~3문장으로. 참고 문구(기준일 · 확인 안내 · 출처)는 위젯 밑에서 옮겨 왔다
const ABOUT = "Convert Korean shoe and clothing sizes, meat portions and room sizes in a second. Korean shoe sizes are foot length in millimeters, so 250 mm is about a US men’s 7 or a US women’s 8; women’s clothing runs 44 to 77 for roughly XS to L, and men’s 90 to 110 for roughly S to XXL. Room sizes are often given in pyeong, and one pyeong is about 3.3 square meters."
const NOTE = (
  <>Note: Sizes are approximate and brands vary by about half a size. Online size charts often list flat measurements, so double them before comparing with your body.</>
)

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: URL },
}

export default function Page() {
  return (
    <div className="tl-wrap ku-wrap">
      <p className="tl-eyebrow">Smart Travel Tools</p>
      <h1 className="tl-h1">Korea Size &amp; Travel Units Converter</h1>
      <p className="tl-lead">Shoes, clothes, meat portions and room sizes, converted in a second.</p>
      <KoreaUnitsModal />
      <ToolAbout text={ABOUT} note={NOTE} />
      <WidgetActionChips tool="size-units" />
      <MoreTools current="/tools/korea-size-converter" />
    </div>
  )
}
