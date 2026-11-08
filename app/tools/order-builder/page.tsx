import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { OrderBuilder } from './OrderBuilder'

const URL = 'https://www.atlaslabstudios.com/tools/order-builder'
const TITLE = 'K-Food Order Builder — Atlas Lab'
const DESCRIPTION = "Build Korean ordering phrases like 'less spicy' or 'no cilantro' and show the screen directly to restaurant staff."

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
      <h1 className="tl-h1">K-Food Order Builder</h1>
      <p className="tl-lead">Pick your dishes and requests, then show the Korean to the staff.</p>
      <OrderBuilder />
      <MoreTools current="/tools/order-builder" />
    </div>
  )
}
