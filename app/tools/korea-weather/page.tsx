import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolFaq, type FaqItem } from '../ToolFaq'
import { WeatherForecast } from './WeatherForecast'

const URL = 'https://www.atlaslabstudios.com/tools/korea-weather'
const TITLE = 'Korea 7-Day Weather Forecast & What to Wear Packing Guide'
const DESCRIPTION = 'Hourly-updated 7-day weather forecasts for 10 major Korean cities with rain probabilities and seasonal clothing advice.'

const FAQ: FaqItem[] = [
  { q: 'How often is the forecast updated?', a: 'The forecast refreshes every hour from WeatherAPI.com, so check again before you head out.' },
  { q: 'Which cities are covered?', a: 'Seoul, Busan, Jeju, Gangneung, Daegu, Jeonju, Gyeongju, Sokcho, Chuncheon and Yeosu.' },
  { q: 'What should I wear in Korea?', a: 'The tool suggests clothing from the temperature, from short sleeves at 28°C and above to a padded jacket, hat and gloves below 5°C. It adds an umbrella when the rain chance is 50% or higher.' },
]

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
      <h1 className="tl-h1">Korea 7-Day Weather &amp; Clothing Advice</h1>
      <p className="tl-lead">Check the weather across Korea and what to wear today.</p>
      <WeatherForecast />
      <WidgetActionChips tool="weather" />
      <ToolFaq items={FAQ} />
      <MoreTools current="/tools/korea-weather" />
    </div>
  )
}
