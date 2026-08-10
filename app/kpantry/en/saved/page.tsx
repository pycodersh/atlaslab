'use client'
import { useEffect, useState } from 'react'
import BottomNav from '@/components/kpantry/layout/BottomNav'
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
      <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#9E9E9E' }}>Loading...</p>
      </div>
    )
  }

  if (!userId) {
    return (
      <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
        <div style={{ padding: '60px 20px 0', textAlign: 'center' }}>
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
          <span style={{ fontSize: 52 }}>🔒</span>
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
              backgroundColor: '#2D5016',
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
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{
        padding: '52px 20px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
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
        <button style={{
          width: 36, height: 36,
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8E0D0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="2" stroke="#6B6B6B" strokeWidth="1.3"/>
            <path d="M9 2V4M9 14V16M2 9H4M14 9H16M4.22 4.22L5.64 5.64M12.36 12.36L13.78 13.78M4.22 13.78L5.64 12.36M12.36 5.64L13.78 4.22" stroke="#6B6B6B" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div style={{
        margin: '0 16px 4px',
        display: 'flex',
        backgroundColor: '#EDE8DC',
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
          🔖 Recipes
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
          🛒 Shopping List
          {shoppingList.filter(i => !i.is_checked).length > 0 && (
            <span style={{
              position: 'absolute',
              top: 6,
              right: 28,
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: '#C4622D',
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

      <BottomNav />
    </div>
  )
}
