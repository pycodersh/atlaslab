import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'About — Atlas Lab',
  description:
    'Atlas Lab Studios builds AI-powered apps for language learning, career growth, and daily life — including Patto, K-Patto, and K-Pantry.',
  alternates: { canonical: 'https://www.atlaslabstudios.com/about' },
}

const S = '"DM Sans","Inter",system-ui,sans-serif'
const D = '"Playfair Display",Georgia,serif'

const PRODUCTS = [
  {
    name: 'Patto',
    tag: 'Live',
    tagColor: '#5DCAA5',
    tagBg: 'rgba(29,158,117,0.15)',
    href: '/patto/home',
    desc: 'An AI-powered English learning app built around native patterns — not grammar rules. Patto teaches you how fluent English speakers actually think, through stories, pattern drills, and spaced repetition.',
    color: '#a89fff',
  },
  {
    name: 'K-Patto',
    tag: 'Beta',
    tagColor: '#60A5FA',
    tagBg: 'rgba(96,165,250,0.15)',
    href: '/kpatto',
    desc: 'Korean pattern learning for global learners. K-Patto uses real Korean internet culture — dramas, slang, and daily expressions — to teach Korean the way it\'s actually spoken.',
    color: '#60a5fa',
  },
  {
    name: 'K-Pantry',
    tag: 'Live',
    tagColor: '#5DCAA5',
    tagBg: 'rgba(29,158,117,0.15)',
    href: '/kpantry/en',
    desc: 'Korean recipe discovery powered by what\'s already in your fridge. Browse hundreds of authentic Korean recipes filtered by your available ingredients, dietary needs, and cooking skill.',
    color: '#fbbf24',
  },
  {
    name: 'Career Navi',
    tag: 'Coming soon',
    tagColor: 'rgba(255,255,255,0.3)',
    tagBg: 'rgba(255,255,255,0.05)',
    href: null,
    desc: 'An AI career navigation service for Korean professionals navigating job searches, salary benchmarks, resume writing, and interview prep.',
    color: '#5DCAA5',
  },
]

export default function AboutPage() {
  return (
    <div style={{ background: '#0a0a1a', color: 'white', fontFamily: S }}>
      <SiteNav />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>
            About
          </p>
          <h1 style={{ fontFamily: D, fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 20, color: '#fff' }}>
            We build tools that make you{' '}
            <span style={{
              background: 'linear-gradient(135deg, #c4b8ff 0%, #a89fff 50%, #7c6fff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              better
            </span>,<br />one skill at a time.
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 560 }}>
            Atlas Lab Studios is an independent software studio building AI-powered apps for
            language learning, career growth, and everyday life. We ship small, focused products
            that solve real problems — deeply.
          </p>
        </div>

        {/* Mission */}
        <div style={{
          background: 'rgba(124,111,255,0.07)',
          border: '0.5px solid rgba(124,111,255,0.2)',
          borderRadius: 16,
          padding: '28px 28px',
          marginBottom: 56,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(168,143,255,0.6)', marginBottom: 12 }}>
            Our Philosophy
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Great learning tools should meet you where you are. They should feel effortless to
            start, impossible to put down, and quietly life-changing over time. We build for depth
            over breadth — each Atlas Lab product does one thing and does it well.
          </p>
        </div>

        {/* Products */}
        <div style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 24 }}>
            Our Products
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PRODUCTS.map(p => (
              <div
                key={p.name}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: '22px 24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{p.name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                    background: p.tagBg, color: p.tagColor,
                    borderRadius: 999, padding: '2px 8px',
                  }}>
                    {p.tag}
                  </span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.75, color: 'rgba(255,255,255,0.55)', marginBottom: p.href ? 14 : 0 }}>
                  {p.desc}
                </p>
                {p.href && (
                  <Link href={p.href} style={{
                    display: 'inline-block', fontSize: 12, fontWeight: 600,
                    color: p.color, textDecoration: 'none',
                  }}>
                    Open app →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Blog link */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '22px 24px',
          marginBottom: 56,
        }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>From the Blog</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 14 }}>
            We publish guides, tips, and insights across all our products in English and Korean.
          </p>
          <Link href="/blog" style={{ fontSize: 13, fontWeight: 600, color: '#a89fff', textDecoration: 'none' }}>
            Browse all articles →
          </Link>
        </div>

        {/* Contact */}
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', paddingTop: 32 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Get in Touch</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 14 }}>
            Questions, feedback, partnership enquiries, or just want to say hi?
          </p>
          <Link href="/contact" style={{
            display: 'inline-block', fontSize: 14, fontWeight: 600,
            color: 'white', background: '#7c6fff',
            padding: '10px 24px', borderRadius: 999, textDecoration: 'none',
          }}>
            Contact us →
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
