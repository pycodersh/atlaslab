import type { Metadata } from 'next'
import { DEFAULT_OPEN_GRAPH } from '@/lib/seo/site'
import { MoreTools } from '../MoreTools'
import { SubwayTimer } from './SubwayTimer'

const URL = 'https://www.atlaslabstudios.com/tools/subway-timer'
const TITLE = '15-Min Subway Timer — Atlas Lab'
const DESCRIPTION = "Check Seoul's free subway re-entry rule and start a 15-minute countdown the moment you tap out."

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
      <h1 className="tl-h1">15-Min Subway Timer</h1>
      <p className="tl-lead">Tapped out by mistake? Re-enter within 15 minutes and the base fare is waived. Start the timer right after you tap out.</p>

      <SubwayTimer />

      <section className="tl-card">
        <h2 className="tl-h2">When re-entry is free</h2>
        <ul className="tl-list">
          <li>You paid with a transit card, such as T-money.</li>
          <li>You tapped out, then tap back in within 15 minutes.</li>
          <li>You re-enter at the same station, through a gate for the same line. Use the same gate if you can.</li>
          <li>It works once per trip. Re-entry is processed as a transfer, which waives the ₩1,550 base fare (first 10 km).</li>
        </ul>
      </section>

      <section className="tl-card">
        <h2 className="tl-h2">When it doesn&apos;t apply</h2>
        <ul className="tl-list">
          <li>Single-journey tickets and commuter passes: call the staff and use the emergency gate.</li>
          <li>AREX, Shinbundang, Gimpo Goldline, Uijeongbu and Yongin light rail, and Incheon Lines 1 and 2.</li>
          <li>Line 7 between Kkachiul and Seoknam.</li>
          <li>Tapped in at the wrong gate but never tapped out? Official notices don&apos;t cover this case, so press the call button at the gate and ask the staff.</li>
        </ul>
      </section>

      <p className="tl-note">
        This timer is a guide only. The gate system&apos;s clock decides, so leave yourself a margin. Official notices don&apos;t say how
        any extra distance fare is handled. Korail lines joined on June 20, 2026; Seoul Metro lines moved to 15 minutes on October 7, 2023.
        Sources: <a href="https://www.korea.kr/news/policyNewsView.do?newsId=148966539" rel="noopener noreferrer" target="_blank">Korea.kr (June 15, 2026)</a>,{' '}
        <a href="https://www.koreajoongangdaily.com/korea/less-running-to-toilet-as-seoul-lengthens-free-subway-reentry-time/11290623" rel="noopener noreferrer" target="_blank">Korea JoongAng Daily (Sept. 25, 2023)</a>.
      </p>

      <MoreTools current="/tools/subway-timer" />
    </div>
  )
}
