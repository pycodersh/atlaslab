'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { TopNav, NAV_HEIGHT } from '@/components/TopNav'
import { getFirstIncompleteItem } from '@/lib/review/home'
import { getTodayReviewItems } from '@/lib/review/storage'

// ── Curated cover images (Unsplash · warm / lifestyle) ─────────────────────
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=900&auto=format&fit=crop', // coffee + open book
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=900&auto=format&fit=crop', // library shelves
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=900&auto=format&fit=crop', // journal on table
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=900&auto=format&fit=crop', // coffee shop window
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=900&auto=format&fit=crop', // forest sunlit path
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=900&auto=format&fit=crop', // paris rain street
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=900&auto=format&fit=crop', // ocean wave
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=900&auto=format&fit=crop', // forest golden light
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=900&auto=format&fit=crop', // winter birch forest
  'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?q=80&w=900&auto=format&fit=crop', // autumn leaves path
  'https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?q=80&w=900&auto=format&fit=crop', // coffee close-up steam
  'https://images.unsplash.com/photo-1473496169904-658ba7574f19?q=80&w=900&auto=format&fit=crop', // clean desk + plant
  'https://images.unsplash.com/photo-1463320726281-696a3cc57e01?q=80&w=900&auto=format&fit=crop', // sunrise mountain
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=900&auto=format&fit=crop', // mountain lake
  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=900&auto=format&fit=crop', // winter walk
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=900&auto=format&fit=crop', // snowy mountain peak
  'https://images.unsplash.com/photo-1490750967868-88df5691cc00?q=80&w=900&auto=format&fit=crop', // spring flowers field
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=900&auto=format&fit=crop', // cozy rainy window
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=900&auto=format&fit=crop', // night sky milky way
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=900&auto=format&fit=crop', // reading on couch
  'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?q=80&w=900&auto=format&fit=crop', // warm evening room
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=900&auto=format&fit=crop', // swiss alps
  'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?q=80&w=900&auto=format&fit=crop', // hot drink foggy
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=900&auto=format&fit=crop', // london night bridge
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=900&auto=format&fit=crop', // beach at sunset
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=900&auto=format&fit=crop', // misty forest
  'https://images.unsplash.com/photo-1499678329028-101435549a4e?q=80&w=900&auto=format&fit=crop', // beach morning
  'https://images.unsplash.com/photo-1507281549113-040fcb6c1ef1?q=80&w=900&auto=format&fit=crop', // book + glasses warm
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=900&auto=format&fit=crop', // mountain stars
  'https://images.unsplash.com/photo-1416169607655-0c2b3ce2e1cc?q=80&w=900&auto=format&fit=crop', // candle + books
]

// ── Daily quotes (30 → cycle per month) ────────────────────────────────────
const DAILY_QUOTES = [
  'Small progress every day.',
  'One story at a time.',
  'Speak naturally.',
  'Every review matters.',
  'Read. Repeat. Remember.',
  'Patterns become habits.',
  'Consistency wins.',
  'Trust your voice.',
  'Stories make language memorable.',
  'Fluency comes from repetition.',
  'One sentence changes everything.',
  'Listen more. Speak better.',
  "Today's practice is tomorrow's fluency.",
  'Language lives in stories.',
  'The best time to learn is now.',
  'Every word is a small victory.',
  'Make it a habit.',
  'Your voice matters.',
  'Progress, not perfection.',
  'One pattern at a time.',
  'Read it. Feel it. Say it.',
  'Stories connect us.',
  'Daily practice builds fluency.',
  'Words are bridges.',
  'Begin again, every day.',
  'Language is alive — keep it moving.',
  'A little every day goes far.',
  'The story continues.',
  'Speak with confidence.',
  'Every day, a little closer.',
]

// Pick by day of year so it stays consistent all day
function byDayOfYear(arr: unknown[]) {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const diff = Date.now() - start.getTime()
  const dayOfYear = Math.floor(diff / 86_400_000)
  return arr[dayOfYear % arr.length]
}

function getNotice(reviewCount: number, hasNewStory: boolean): string {
  if (reviewCount >= 2) return `${reviewCount} reviews are ready.`
  if (reviewCount === 1) return '1 review is waiting.'
  if (hasNewStory) return 'A new story is waiting.'
  return "Today's learning is ready."
}

function getDateLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase()
}

// ── Component ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const [notice, setNotice] = useState<string | null>(null)
  const [firstHref, setFirstHref] = useState('/stories/1')

  const coverUrl = byDayOfYear(COVER_IMAGES) as string
  const quote     = byDayOfYear(DAILY_QUOTES) as string
  const dateLabel = getDateLabel()

  // Load localStorage-based data client-side only
  useEffect(() => {
    const reviews = getTodayReviewItems()
    const first   = getFirstIncompleteItem()
    setNotice(getNotice(reviews.length, !!first))
    if (first) setFirstHref(first.href)
  }, [])

  return (
    <div className="min-h-dvh bg-[var(--pb)] overflow-x-hidden">
      <TopNav />

      {/* ── Hero Image ─────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden animate-fade-in"
        style={{
          marginTop: NAV_HEIGHT,
          height: 'calc(52vh - 0px)',
          animationDelay: '0ms',
          opacity: 0,
        }}
      >
        <Image
          src={coverUrl}
          alt="Daily cover"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Bottom vignette so the content transition feels smooth */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: '40%', background: 'linear-gradient(to bottom, transparent, var(--pb))' }}
        />
        {/* Top-left mini masthead */}
        <div className="absolute top-5 left-6">
          <p
            className="text-white/70 font-bold tracking-[0.28em]"
            style={{ fontSize: 10, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
          >
            PATTO
          </p>
        </div>
        {/* Top-right date */}
        <div className="absolute top-5 right-6">
          <p
            className="text-white/60 tracking-[0.14em]"
            style={{ fontSize: 10, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
          >
            {dateLabel}
          </p>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="px-7 pb-24 max-w-sm mx-auto">

        {/* Quote */}
        <div
          className="animate-fade-up pt-6 mb-7"
          style={{ animationDelay: '320ms', opacity: 0 }}
        >
          <p
            className="font-playfair font-bold italic leading-snug text-[var(--pt)]"
            style={{ fontSize: 'clamp(1.35rem, 5vw, 1.65rem)' }}
          >
            {quote}
          </p>
        </div>

        {/* Divider */}
        <div
          className="animate-fade-in h-px bg-[var(--pd)] mb-6"
          style={{ animationDelay: '560ms', opacity: 0 }}
        />

        {/* Notice */}
        <div
          className="animate-fade-up mb-8"
          style={{ animationDelay: '660ms', opacity: 0 }}
        >
          <p className="text-[12.5px] text-[var(--pm)] tracking-[0.04em]">
            {notice ?? ' '}
          </p>
        </div>

        {/* Continue Learning — the only button */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: '820ms', opacity: 0 }}
        >
          <button
            type="button"
            onClick={() => router.push(firstHref)}
            className="flex items-center gap-2.5 px-7 py-4 rounded-full bg-[var(--pa)] text-white font-bold tracking-[0.1em] hover:opacity-90 active:scale-[0.97] transition-all cursor-pointer"
            style={{ fontSize: 12 }}
          >
            Continue Learning
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </div>
  )
}
