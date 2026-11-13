import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { WidgetActionChips } from '../WidgetActionChips'
import { ToolAbout } from '../ToolAbout'
import { WeatherForecast } from './WeatherForecast'

const URL = 'https://www.atlaslabstudios.com/tools/korea-weather'
const TITLE = 'Korea 7-Day Weather Forecast & What to Wear Packing Guide'
const DESCRIPTION = 'Hourly-updated 7-day weather forecasts for 10 major Korean cities with rain probabilities and seasonal clothing advice.'

// About this tool — 예전 FAQ 의 핵심을 2~3문장으로. 참고 문구(기준일 · 확인 안내 · 출처)는 위젯 밑에서 옮겨 왔다
const ABOUT = "Tap a city on the map to see current conditions and a 7-day forecast for ten places across Korea, from Seoul and Busan to Jeju, Gangneung and Sokcho. Each city also gets clothing advice from the temperature, from short sleeves at 28°C and above to a padded jacket, hat and gloves below 5°C, plus an umbrella when the chance of rain is 50% or higher."
const NOTE = (
  <>Note: Forecasts refresh hourly and can change, so check again before you head out.{' '}<a href="https://www.weatherapi.com/" rel="noopener noreferrer" target="_blank">Powered by WeatherAPI.com</a>.</>
)

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
      <ToolAbout text={ABOUT} note={NOTE} />
      <WidgetActionChips tool="weather" />
      <MoreTools current="/tools/korea-weather" />
    </div>
  )
}
