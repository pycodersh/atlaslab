'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import RecipeCard from './RecipeCard'
import CategoryTabs from './CategoryTabs'
import {
  getFeaturedRecipe,
  getPopularRecipes,
  getRecentRecipes,
  getRecipes,
} from '@/lib/kpantry/recipes'

const CATEGORY_IMAGES: Record<string, string | undefined> = {
  stews:      process.env.NEXT_PUBLIC_IMG_CAT_STEWS,
  rice:       process.env.NEXT_PUBLIC_IMG_CAT_RICE,
  noodles:    process.env.NEXT_PUBLIC_IMG_CAT_NOODLES,
  side_dishes: process.env.NEXT_PUBLIC_IMG_CAT_SIDES,
}

const CATEGORY_LABELS: Record<string, string> = {
  stews: 'Stews & Soups',
  rice: 'Rice & Grains',
  noodles: 'Noodles',
  side_dishes: 'Side Dishes',
}

export default function ExploreView() {
  const router = useRouter()
  const [category, setCategory] = useState('all')
  const [featured, setFeatured] = useState<any>(null)
  const [popular, setPopular] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [f, p, r] = await Promise.all([
          getFeaturedRecipe(),
          getPopularRecipes().catch(e => { console.error('[ExploreView] getPopularRecipes:', e); return [] }),
          getRecentRecipes().catch(e => { console.error('[ExploreView] getRecentRecipes:', e); return [] }),
        ])
        setFeatured(f)
        setPopular((p as any[]) ?? [])
        setRecent((r as any[]) ?? [])
      } catch (e) {
        console.error('[ExploreView] load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function loadFiltered() {
      try {
        const data = await getRecipes(category === 'all' ? undefined : category)
        setFiltered(data ?? [])
      } catch (e) {
        console.error('[ExploreView] loadFiltered:', e)
        setFiltered([])
      }
    }
    loadFiltered()
  }, [category])

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#9E9E9E' }}>Loading recipes...</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ padding: '52px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 28,
            fontWeight: 700,
            color: '#1A1A1A',
            margin: 0,
          }}>
            Recipes
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#6B6B6B',
            margin: '2px 0 0',
          }}>
            Discover Korean recipes
          </p>
        </div>
        <button style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          border: '1px solid #E8E0D0',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="#6B6B6B" strokeWidth="1.5"/>
            <path d="M12.5 12.5L16 16" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <CategoryTabs selected={category} onChange={setCategory} />

      {category === 'all' && featured && (
        <div style={{ padding: '16px 16px 0' }}>
          <div
            onClick={() => router.push(`/kpantry/en/recipes/${featured.slug}`)}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              position: 'relative',
              height: 200,
              backgroundColor: '#2D2D2D',
              cursor: 'pointer',
            }}
          >
            {featured.hero_image_url ? (
              <img src={featured.hero_image_url} alt={featured.name_en}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#3D2B1A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 80,
              }}>
                🍲
              </div>
            )}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '20px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
            }}>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                color: '#FFD700',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                ⭐ Featured Recipe
              </span>
              <h2 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 22,
                fontWeight: 700,
                color: '#FFFFFF',
                margin: '4px 0 0',
              }}>
                {featured.name_en}
              </h2>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: 'rgba(255,255,255,0.8)',
                margin: '4px 0 0',
              }}>
                {featured.description}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  ⏱ {featured.cooking_time_min} min
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  🔥 {featured.calories} kcal
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {category === 'all' && popular.length > 0 && (
        <section style={{ padding: '20px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              🔥 Popular Recipes
            </h3>
            <button style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B6B6B', background: 'none', border: 'none', cursor: 'pointer' }}>
              View all
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none' }}>
            {popular.map(r => (
              <RecipeCard
                key={r.id}
                slug={r.slug}
                nameEn={r.name_en}
                description={r.description}
                cookingTimeMin={r.cooking_time_min}
                calories={r.calories}
                difficulty={r.difficulty}
                heroImageUrl={r.hero_image_url}
              />
            ))}
          </div>
        </section>
      )}

      {category === 'all' && (
        <section style={{ padding: '20px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              Explore by Category
            </h3>
            <button style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B6B6B', background: 'none', border: 'none', cursor: 'pointer' }}>
              View all
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(['stews', 'rice', 'noodles', 'side_dishes'] as const).map(cat => (
              <div
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  borderRadius: 16,
                  height: 100,
                  backgroundColor: '#3D2B1A',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {CATEGORY_IMAGES[cat] ? (
                  <img
                    src={CATEGORY_IMAGES[cat]}
                    alt={cat}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-60%)', fontSize: 40 }}>
                    🍽
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.65))',
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                    {CATEGORY_LABELS[cat]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {category === 'all' && recent.length > 0 && (
        <section style={{ padding: '20px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              Recently Added
            </h3>
            <button style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B6B6B', background: 'none', border: 'none', cursor: 'pointer' }}>
              View all
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recent.map(r => (
              <RecipeCard
                key={r.id}
                slug={r.slug}
                nameEn={r.name_en}
                nameKo={r.name_ko}
                cookingTimeMin={r.cooking_time_min}
                calories={r.calories}
                heroImageUrl={r.hero_image_url}
                variant="horizontal"
              />
            ))}
          </div>
        </section>
      )}

      {category !== 'all' && (
        <section style={{ padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {filtered.map(r => (
              <RecipeCard
                key={r.id}
                slug={r.slug}
                nameEn={r.name_en}
                description={r.description}
                cookingTimeMin={r.cooking_time_min}
                calories={r.calories}
                difficulty={r.difficulty}
                heroImageUrl={r.hero_image_url}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
