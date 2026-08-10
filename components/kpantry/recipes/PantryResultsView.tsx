'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import RecipeCard from './RecipeCard'
import { getPantryMatches, getUserPantry } from '@/lib/kpantry/recipes'
import { getUserPlan, canAccess } from '@/lib/kpantry/subscription'
import { createClient } from '@/lib/kpantry/supabase'
import PaywallModal from '@/components/kpantry/paywall/PaywallModal'
import AuthModal from '@/components/kpantry/auth/AuthModal'

export default function PantryResultsView() {
  const router = useRouter()
  const [matches, setMatches] = useState<{ ready: any[], addOne: any[], addTwo: any[] } | null>(null)
  const [pantry, setPantry] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [paywallFeature, setPaywallFeature] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const [m, p, userPlan] = await Promise.all([
        getPantryMatches(user.id),
        getUserPantry(user.id),
        getUserPlan(user.id),
      ])
      setMatches(m)
      setPantry(p ?? [])
      setPlan(userPlan)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#9E9E9E' }}>Finding recipes for you...</p>
      </div>
    )
  }

  if (!matches) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#1A1A1A', fontWeight: 600 }}>
          Save your ingredients first
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B6B6B' }}>
          Go to HOME and add your ingredients.
        </p>
        <button
          onClick={() => router.push('/kpantry/en')}
          style={{
            marginTop: 16,
            padding: '12px 24px',
            backgroundColor: '#2D5016',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 12,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Go to Home
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ padding: '52px 20px 16px' }}>
        <button
          onClick={() => router.push('/kpantry/en/recipes')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 8px', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4L7 10L13 16" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 24,
          fontWeight: 700,
          color: '#1A1A1A',
          margin: 0,
        }}>
          Recipes for Your Pantry
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: '#6B6B6B',
          margin: '4px 0 0',
        }}>
          Based on the ingredients you have.
        </p>
      </div>

      <div style={{
        margin: '0 16px 16px',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: '12px 14px',
        border: '1px solid #E8E0D0',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B6B6B', flexShrink: 0 }}>
          You have {pantry.length} ingredients
        </span>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', flex: 1 }}>
          {pantry.slice(0, 8).map((p: any) => (
            <span key={p.ingredient_id} style={{ fontSize: 18 }}>🥬</span>
          ))}
        </div>
        <button
          onClick={() => router.push('/kpantry/en/ingredients')}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#2D5016',
            background: 'none',
            border: '1.5px solid #2D5016',
            borderRadius: 8,
            padding: '4px 10px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Edit
        </button>
      </div>

      {matches.ready.length > 0 && (
        <section style={{ padding: '0 0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                  Ready to cook
                </h3>
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  color: '#2D5016',
                  backgroundColor: '#EDF4E8',
                  borderRadius: 20,
                  padding: '2px 8px',
                  fontWeight: 500,
                }}>
                  No extra ingredients
                </span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B', margin: '4px 0 0' }}>
                You can make these dishes right now!
              </p>
            </div>
            <button style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B6B6B', background: 'none', border: 'none', cursor: 'pointer' }}>
              View all ›
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none' }}>
            {matches.ready.slice(0, 6).map((r, i) => (
              <div key={r.id} style={{ position: 'relative' }}>
                {i === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 2,
                    backgroundColor: '#2D5016',
                    color: '#FFFFFF',
                    borderRadius: 20,
                    padding: '3px 8px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    + Best Match
                  </div>
                )}
                <RecipeCard
                  slug={r.slug}
                  nameEn={r.name_en}
                  cookingTimeMin={r.cooking_time_min}
                  difficulty={r.difficulty}
                  variant="pantry"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {matches.addOne.length > 0 && (
        <section style={{ padding: '0 0 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                Add 1 ingredient
              </h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B', margin: '4px 0 0' }}>
                Add one more ingredient to make these tasty dishes!
              </p>
            </div>
            <button style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B6B6B', background: 'none', border: 'none', cursor: 'pointer' }}>
              View all ›
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none', filter: canAccess('pantry_plus1', plan) ? 'none' : 'blur(4px)', pointerEvents: canAccess('pantry_plus1', plan) ? 'auto' : 'none' }}>
            {matches.addOne.slice(0, 6).map(r => (
              <RecipeCard
                key={r.id}
                slug={r.slug}
                nameEn={r.name_en}
                cookingTimeMin={r.cooking_time_min}
                difficulty={r.difficulty}
                missingIngredients={r.missingIngredients}
                variant="pantry"
              />
            ))}
          </div>
          {!canAccess('pantry_plus1', plan) && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              zIndex: 10,
            }}>
              <span style={{ fontSize: 28 }}>🔒</span>
              <button
                onClick={() => setPaywallFeature('pantry_plus1')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#C4622D',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 20,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Upgrade to See More
              </button>
            </div>
          )}
        </section>
      )}

      {matches.addTwo.length > 0 && (
        <section style={{ padding: '0 0 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                Add 2 ingredients
              </h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B', margin: '4px 0 0' }}>
                Add two more ingredients for even more delicious options!
              </p>
            </div>
            <button style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B6B6B', background: 'none', border: 'none', cursor: 'pointer' }}>
              View all ›
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none', filter: canAccess('pantry_plus2', plan) ? 'none' : 'blur(4px)', pointerEvents: canAccess('pantry_plus2', plan) ? 'auto' : 'none' }}>
            {matches.addTwo.slice(0, 6).map(r => (
              <RecipeCard
                key={r.id}
                slug={r.slug}
                nameEn={r.name_en}
                cookingTimeMin={r.cooking_time_min}
                difficulty={r.difficulty}
                missingIngredients={r.missingIngredients}
                variant="pantry"
              />
            ))}
          </div>
          {!canAccess('pantry_plus2', plan) && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              zIndex: 10,
            }}>
              <span style={{ fontSize: 28 }}>🔒</span>
              <button
                onClick={() => setPaywallFeature('pantry_plus2')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#C4622D',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 20,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Upgrade to See More
              </button>
            </div>
          )}
        </section>
      )}

      <div style={{
        margin: '0 16px 20px',
        backgroundColor: '#F5F0E8',
        borderRadius: 16,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #E8E0D0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              Want to see more recipes?
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6B6B6B', margin: '2px 0 0' }}>
              Add or remove ingredients to get better recommendations.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/kpantry/en/ingredients')}
          style={{
            flexShrink: 0,
            padding: '10px 14px',
            backgroundColor: '#2D5016',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Edit Ingredients
        </button>
      </div>

      {paywallFeature && (
        <PaywallModal
          feature={paywallFeature}
          onClose={() => setPaywallFeature(null)}
          onSignIn={() => { setPaywallFeature(null); setShowAuth(true) }}
        />
      )}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); window.location.reload() }}
        />
      )}
    </div>
  )
}
