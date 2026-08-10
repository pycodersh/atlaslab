'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import IngredientCarousel from '@/components/kpantry/ingredients/IngredientCarousel'
import IngredientCategoryTabs from '@/components/kpantry/ingredients/IngredientCategoryTabs'
import SelectedIngredients from '@/components/kpantry/ingredients/SelectedIngredients'
import { getIngredients, savePantry, loadPantry } from '@/lib/kpantry/ingredients'
import { getUserPlan, canAccess } from '@/lib/kpantry/subscription'
import { createClient } from '@/lib/kpantry/supabase'
import PaywallModal from '@/components/kpantry/paywall/PaywallModal'
import AuthModal from '@/components/kpantry/auth/AuthModal'

export default function IngredientsPage() {
  const router = useRouter()
  const [category, setCategory] = useState('all')
  const [ingredients, setIngredients] = useState<any[]>([])
  const [allIngredients, setAllIngredients] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [showPaywall, setShowPaywall] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const all = await getIngredients()
      setAllIngredients(all ?? [])
      setIngredients(all ?? [])

      if (user) {
        const [pantryIds, userPlan] = await Promise.all([
          loadPantry(user.id),
          getUserPlan(user.id),
        ])
        setSelectedIds(pantryIds)
        setPlan(userPlan)
      }
    }
    load()
  }, [])

  useEffect(() => {
    let filtered = allIngredients
    if (category !== 'all') {
      filtered = filtered.filter(ing => ing.category === category)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(ing =>
        ing.name.toLowerCase().includes(q) ||
        ing.name_ko?.includes(q) ||
        ing.aliases?.some((a: string) => a.toLowerCase().includes(q))
      )
    }
    setIngredients(filtered)
  }, [category, searchQuery, allIngredients])

  const handleToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setShowAuth(true)
      return
    }

    if (!canAccess('save_pantry', plan)) {
      setShowPaywall(true)
      return
    }

    setSaving(true)
    await savePantry(user.id, selectedIds)
    setSaving(false)
    router.push('/kpantry/en')
  }

  const selectedIngredients = allIngredients.filter(ing => selectedIds.includes(ing.id))

  return (
    <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', paddingBottom: 120 }}>
      <div style={{
        padding: '52px 20px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8E0D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9L11 14" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 20,
          fontWeight: 700,
          color: '#1A1A1A',
          margin: 0,
        }}>
          I Have Ingredients
        </h1>

        <button
          onClick={() => setSelectedIds([])}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#6B6B6B',
            background: 'none',
            border: '1px solid #E8E0D0',
            borderRadius: 20,
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ↺ Clear
        </button>
      </div>

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        color: '#9E9E9E',
        textAlign: 'center',
        margin: '0 0 16px',
      }}>
        Select the ingredients you have.
      </p>

      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          padding: '12px 16px',
          border: '1px solid #E8E0D0',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#9E9E9E" strokeWidth="1.3"/>
            <path d="M11 11L14 14" stroke="#9E9E9E" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search ingredients"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: '#1A1A1A',
              backgroundColor: 'transparent',
            }}
          />
        </div>
      </div>

      <IngredientCategoryTabs selected={category} onChange={cat => { setCategory(cat) }} />

      {ingredients.length > 0 ? (
        <IngredientCarousel
          ingredients={ingredients}
          selectedIds={selectedIds}
          onToggle={handleToggle}
        />
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#9E9E9E' }}>
            No ingredients found.
          </p>
        </div>
      )}

      <SelectedIngredients
        selectedIngredients={selectedIngredients}
        onRemove={handleToggle}
      />

      {selectedIds.length > 0 && (
        <div style={{
          margin: '12px 16px',
          backgroundColor: '#EDF4E8',
          borderRadius: 14,
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          border: '1px solid #C8E6C9',
        }}>
          <span style={{ fontSize: 24 }}>💡</span>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#2D5016',
            margin: 0,
          }}>
            Find recipes you can make with what you have!
          </p>
        </div>
      )}

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        backgroundColor: '#F5F0E8',
        borderTop: '1px solid #E8E0D0',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      }}>
        <button
          onClick={handleSave}
          disabled={saving || selectedIds.length === 0}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: selectedIds.length > 0 ? '#2D5016' : '#C8C0B0',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 14,
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            fontWeight: 600,
            cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {saving ? 'Saving...' : `💾 Save Ingredients (${selectedIds.length})`}
        </button>
      </div>

      {showPaywall && (
        <PaywallModal
          feature="save_pantry"
          onClose={() => setShowPaywall(false)}
          onSignIn={() => { setShowPaywall(false); setShowAuth(true) }}
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
