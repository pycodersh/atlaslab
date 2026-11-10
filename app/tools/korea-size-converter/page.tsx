import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { ToolFaq, type FaqItem } from '../ToolFaq'
import { KoreaUnitsModal } from './KoreaUnitsModal'

const URL = 'https://www.atlaslabstudios.com/tools/korea-size-converter'
const TITLE = 'Korea Clothing & Shoe Size Converter (mm to US/EU) | Pyeong to Sqm'
const DESCRIPTION = 'Convert Korean shoe sizes (mm), clothing tags, K-BBQ meat portions in grams, and hotel/apartment room sizes in Pyeong.'

const FAQ: FaqItem[] = [
  { q: 'How are Korean shoe sizes measured?', a: 'Korean shoe sizes are the length of the foot in millimeters. For example, 250 mm is about a US men’s 7 or a US women’s 8, though brands vary by about half a size.' },
  { q: 'What do 55 or 95 mean on Korean clothing?', a: 'Women’s sizes 44, 55, 66 and 77 roughly match XS to L, and men’s sizes 90 to 110 roughly match S to XXL. Online size charts often list flat measurements, so double them to compare with your body.' },
  { q: 'How big is one pyeong?', a: 'One pyeong is about 3.3 square meters, or about 35.6 square feet. A 10-pyeong studio is about 33 square meters.' },
]

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
      <ToolFaq items={FAQ} />
      <MoreTools current="/tools/korea-size-converter" />
    </div>
  )
}
