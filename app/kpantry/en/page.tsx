import BottomNav from '@/components/kpantry/layout/BottomNav'
import HaveIngredientsCard from '@/components/kpantry/home/HaveIngredientsCard'
import WantToCookCard from '@/components/kpantry/home/WantToCookCard'
import PopularDishes from '@/components/kpantry/home/PopularDishes'
import KoreanPantrySection from '@/components/kpantry/home/KoreanPantrySection'

const HERO_IMG = process.env.NEXT_PUBLIC_IMG_HERO

export default function KPantryHomePage() {
  return (
    <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
      {/* Hero Banner */}
      {HERO_IMG && (
        <div style={{
          position: 'relative',
          height: 220,
          overflow: 'hidden',
          backgroundColor: '#111111',
        }}>
          <img
            src={HERO_IMG}
            alt="Korean food"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.7,
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 100%)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px 20px 24px',
          }}>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              margin: '0 0 4px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Korean Home Cooking
            </p>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 34,
              fontWeight: 700,
              color: '#FAF7F2',
              margin: 0,
              lineHeight: 1.1,
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}>
              K-Pantry
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: 'rgba(255,255,255,0.8)',
              margin: '4px 0 0',
            }}>
              Cook Korean with What You Have.
            </p>
          </div>

          {/* Top nav overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '52px 20px 0',
          }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" fill="white"/>
                <path d="M18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="white"/>
              </svg>
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.5"/>
                <path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* No-hero fallback header */}
      {!HERO_IMG && (
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '52px 20px 16px',
        }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" fill="#1A1A1A"/>
              <path d="M18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="#1A1A1A"/>
            </svg>
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="#1A1A1A" strokeWidth="1.5"/>
              <path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </header>
      )}

      {!HERO_IMG && (
        <div style={{ padding: '0 20px 20px' }}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 36,
            fontWeight: 700,
            color: '#1A1A1A',
            margin: 0,
            lineHeight: 1.1,
          }}>
            K-Pantry
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#6B6B6B',
            margin: '4px 0 0',
          }}>
            Cook Korean with What You Have.
          </p>
        </div>
      )}

      <HaveIngredientsCard />
      <WantToCookCard />
      <PopularDishes />
      <KoreanPantrySection />

      <BottomNav />
    </div>
  )
}
