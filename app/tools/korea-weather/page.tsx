import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WeatherForecast } from './WeatherForecast'

const URL = 'https://www.atlaslabstudios.com/tools/weather'
const TITLE = 'Korea Weather & 7-Day Forecast — Atlas Lab'
const DESCRIPTION = 'Current weather and 7-day forecasts for ten Korean travel cities, with rain chances and what to wear.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { ...DEFAULT_OPEN_GRAPH, title: TITLE, description: DESCRIPTION, url: URL },
}

export default function Page() {
  return (
    <div className="tl-wrap wf-wrap">
      <p className="tl-eyebrow">Smart Travel Tools</p>
      <h1 className="tl-h1">Korea Weather &amp; 7-Day Forecast</h1>
      <p className="tl-lead">Check the weather across Korea and what to wear today.</p>
      <WeatherForecast />
      <MoreTools current="/tools/weather" />
    </div>
  )
}
