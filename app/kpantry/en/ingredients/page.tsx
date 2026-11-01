'use client'
import { RotateCcw } from 'lucide-react'
import { META_ICON } from '@/components/kpantry/ui/icon'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import IngredientGrid from '@/components/kpantry/ingredients/IngredientGrid'
import IngredientCategoryTabs from '@/components/kpantry/ingredients/IngredientCategoryTabs'
import SelectedIngredients from '@/components/kpantry/ingredients/SelectedIngredients'
import {
  getIngredients,
  savePantry,
  loadPantry,
  parseIngredientIds,
  readSelectedIngredients,
  writeSelectedIngredients,
} from '@/lib/kpantry/ingredients'
import { getUserPlan, canAccess } from '@/lib/kpantry/subscription'
import { createClient } from '@/lib/kpantry/supabase'
import PaywallModal from '@/components/kpantry/paywall/PaywallModal'
import AuthModal from '@/components/kpantry/auth/AuthModal'

export default function IngredientsPage() {
  const router = useRouter()
  const [category, setCategory] = useState('all')
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

      // 처음 선택: URL(결과 화면 Edit 에서 돌아옴) > 이 기기에서 마지막으로 고른 것 > 계정에 저장된 pantry
      const urlIds = parseIngredientIds(new URLSearchParams(window.location.search).get('ids'))
      const localIds = readSelectedIngredients()
      const [pantryIds, userPlan] = await Promise.all([
        user ? loadPantry(user.id) : Promise.resolve<string[]>([]),
        getUserPlan(user?.id),
      ])
      const initial = urlIds.length > 0 ? urlIds : localIds.length > 0 ? localIds : pantryIds
      setSelectedIds(initial)
      writeSelectedIngredients(initial)
      setPlan(userPlan)
    }
    load()
  }, [])

  // 선택이 바뀔 때마다 이 기기에 남긴다 — 다음에 이 화면을 열면 이어서 보인다
  const updateSelection = (next: string[]) => {
    setSelectedIds(next)
    writeSelectedIngredients(next)
  }

  // 필터 결과는 상태로 따로 들고 있지 않고 매 렌더 계산한다 — 탭·검색과 목록이 어긋날 틈이 없다
  const ingredients = useMemo(() => {
    let filtered = allIngredients
    if (category !== 'all') {
      filtered = filtered.filter(ing => ing.category === category)
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      filtered = filtered.filter(ing =>
        ing.name.toLowerCase().includes(q) ||
        ing.name_ko?.includes(q) ||
        ing.aliases?.some((a: string) => a.toLowerCase().includes(q))
      )
    }
    return filtered
  }, [category, searchQuery, allIngredients])

  const handleToggle = (id: string) => {
    updateSelection(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id])
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

  // 저장 없이 지금 고른 재료로 바로 매칭한다 — 로그인·Pro 가 없어도 'Ready to cook' 은 보인다
  const handleViewRecipes = () => {
    router.push(`/kpantry/en/recipes?mode=pantry&ids=${selectedIds.join(',')}`)
  }

  const selectedIngredients = allIngredients.filter(ing => selectedIds.includes(ing.id))

  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 120 }}>
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
            border: '1px solid var(--kp-rule)',
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
          onClick={() => updateSelection([])}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#6B6B6B',
            background: 'none',
            border: '1px solid var(--kp-rule)',
            borderRadius: 20,
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <RotateCcw {...META_ICON} />Clear
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
          border: '1px solid var(--kp-rule)',
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

      {selectedIngredients.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <SelectedIngredients
            selectedIngredients={selectedIngredients}
            onRemove={handleToggle}
          />
        </div>
      )}

      <IngredientCategoryTabs selected={category} onChange={cat => { setCategory(cat) }} />

      {ingredients.length > 0 ? (
        <IngredientGrid
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

      {selectedIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 430,
          zIndex: 50,
          padding: '12px 16px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--kp-rule)',
            borderRadius: 18,
            padding: '10px 10px 10px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                color: '#1A1A1A',
                margin: 0,
              }}>
                {selectedIds.length} selected
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--kp-secondary)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  marginTop: 2,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {saving ? 'Saving...' : 'Save to my pantry'}
              </button>
            </div>
            <button
              type="button"
              onClick={handleViewRecipes}
              style={{
                flexShrink: 0,
                padding: '14px 18px',
                backgroundColor: 'var(--kp-accent)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 14,
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              View Recipes
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 3L11 8L6 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

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
