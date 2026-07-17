import Link from 'next/link'

export default function Page() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'sans-serif', fontSize: 16, margin: 0 }}>Episode 4 — Coming Soon</p>
      <Link href="/" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textDecoration: 'none' }}>← Back</Link>
    </div>
  )
}
