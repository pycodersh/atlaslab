'use client'
import Link from 'next/link'
import { Bookmark, Lock, ShoppingCart, UserRound } from 'lucide-react'
import { META_ICON, PLACEHOLDER_ICON } from '@/components/kpantry/ui/icon'
import { useEffect, useState } from 'react'
import HomeLink from '@/components/kpantry/layout/HomeLink'
import SavedRecipesTab from '@/components/kpantry/saved/SavedRecipesTab'
import ShoppingListTab from '@/components/kpantry/saved/ShoppingListTab'
import { getSavedRecipes, getShoppingList, unsaveRecipe } from '@/lib/kpantry/saved'
import { getUserPlan } from '@/lib/kpantry/subscription'
import { createClient } from '@/lib/kpantry/supabase'
import PaywallModal from '@/components/kpantry/paywall/PaywallModal'
import AuthModal from '@/components/kpantry/auth/AuthModal'

type TabType = 'recipes' | 'shopping'

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<TabType>('recipes')
  const [savedRecipes, setSavedRecipes] = useState<any[]>([])
  const [shoppingList, setShoppingList] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [loading, setLoading] = useState(true)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const loadData = async (uid: string) => {
    const [recipes, shopping] = await Promise.all([
      getSavedRecipes(uid),
      getShoppingList(uid),
    ])
    setSavedRecipes(recipes)
    setShoppingList(shopping)
  }

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        const [, userPlan] = await Promise.all([
          loadData(user.id),
          getUserPlan(user.id),
        ])
        setPlan(userPlan)
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleUnsave = async (recipeId: string) => {
    if (!userId) return
    await unsaveRecipe(userId, recipeId)
    await loadData(userId)
  }

  const handleRefreshShopping = async () => {
    if (!userId) return
    const shopping = await getShoppingList(userId)
    setShoppingList(shopping)
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#9E9E9E' }}>Loading...</p>
      </div>
    )
  }

  if (!userId) {
    return (
      <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 24 }}>
        <div style={{ padding: '40px 20px 0' }}><HomeLink /></div>
        <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 28, fontWeight: 700,
            color: '#1A1A1A', margin: '0 0 8px',
          }}>
            Saved
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9E9E9E', margin: '0 0 32px' }}>
            Your favorite recipes & shopping list
          </p>
          <Lock size={48} {...PLACEHOLDER_ICON} />
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 15,
            fontWeight: 600, color: '#1A1A1A', margin: '16px 0 8px',
          }}>
            Sign in to access your saved items
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9E9E9E', margin: '0 0 24px' }}>
            Save recipes, build your shopping list, and track your pantry.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            style={{
              padding: '14px 32px',
              backgroundColor: 'var(--kp-accent)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 14,
              fontFamily: 'Inter, sans-serif',
              fontSize: 15, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </div>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={() => { setShowAuth(false); window.location.reload() }}
          />
        )}
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--kp-bg)', minHeight: '100vh', paddingBottom: 24 }}>
      <div style={{
        padding: '40px 20px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ marginBottom: 14 }}><HomeLink /></div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 28, fontWeight: 700,
            color: '#1A1A1A', margin: '0 0 2px',
          }}>
            Saved
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9E9E9E', margin: 0 }}>
            Your favorite recipes & shopping list
          </p>
        </div>
        {/* 계정 — 홈 헤더의 프로필 버튼이 저장 아이콘으로 바뀌어서 Pro·라이선스 관리는 여기서 연다 */}
        <Link href="/kpantry/en/subscribe" aria-label="Account" style={{
          width: 36, height: 36,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--kp-rule)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <UserRound size={18} strokeWidth={1.75} color="#4B5563" aria-hidden="true" />
        </Link>
      </div>

      <div style={{
        margin: '0 16px 4px',
        display: 'flex',
        backgroundColor: 'var(--kp-surface-muted)',
        borderRadius: 14,
        padding: 4,
      }}>
        <button
          onClick={() => setActiveTab('recipes')}
          style={{
            flex: 1,
            padding: '11px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: activeTab === 'recipes' ? '#FFFFFF' : 'transparent',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: activeTab === 'recipes' ? 600 : 400,
            color: activeTab === 'recipes' ? '#1A1A1A' : '#6B6B6B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: activeTab === 'recipes' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <Bookmark {...META_ICON} />Recipes
        </button>
        <button
          onClick={() => setActiveTab('shopping')}
          style={{
            flex: 1,
            padding: '11px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: activeTab === 'shopping' ? '#FFFFFF' : 'transparent',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            fontWeight: activeTab === 'shopping' ? 600 : 400,
            color: activeTab === 'shopping' ? '#1A1A1A' : '#6B6B6B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: activeTab === 'shopping' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            position: 'relative',
          }}
        >
          <ShoppingCart {...META_ICON} />Shopping List
          {shoppingList.filter(i => !i.is_checked).length > 0 && (
            <span style={{
              position: 'absolute',
              top: 6,
              right: 28,
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: 'var(--kp-accent)',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {shoppingList.filter(i => !i.is_checked).length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'recipes' ? (
        <SavedRecipesTab
          savedRecipes={savedRecipes}
          onUnsave={handleUnsave}
          plan={plan}
          onUpgrade={() => setShowPaywall(true)}
        />
      ) : (
        <ShoppingListTab
          items={shoppingList}
          userId={userId}
          onRefresh={handleRefreshShopping}
        />
      )}

      {showPaywall && (
        <PaywallModal
          feature="saved_unlimited"
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
