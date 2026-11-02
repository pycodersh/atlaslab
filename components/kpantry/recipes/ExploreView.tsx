'use client'
import Link from 'next/link'
import { Bookmark, Clock, Flame, UtensilsCrossed } from 'lucide-react'
import { META_ICON, PLACEHOLDER_ICON } from '@/components/kpantry/ui/icon'
import { useEffect, useMemo, useState } from 'react'
import CategoryTabs from './CategoryTabs'
import { getRecipes, toggleSaveRecipe } from '@/lib/kpantry/recipes'
import { getSavedRecipeIds } from '@/lib/kpantry/saved'
import { createClient } from '@/lib/kpantry/supabase'
import AuthModal from '@/components/kpantry/auth/AuthModal'

type Sort = 'popular' | 'name'

/**
 * Recipes 탭 — 레시피 103개 카탈로그. 배너·인기·카테고리 카드·최근 추가 섹션은 홈·탭과 겹쳐서 없앴다.
 * 전체를 한 번 받아 두고 탭·정렬은 화면에서 거른다 — 탭을 눌러도 다시 불러오지 않아 바로 바뀐다.
 * 인기순은 is_popular 를 앞에 두고 그 안은 이름순(조회수 같은 숫자 컬럼이 없다).
 */
export default function ExploreView() {
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState<Sort>('popular')
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const [data, { data: { user } }] = await Promise.all([getRecipes(), supabase.auth.getUser()])
        setRecipes(data ?? [])
        if (user) {
          setUserId(user.id)
          setSavedIds(new Set(await getSavedRecipeIds(user.id).catch(() => [])))
        }
      } catch (e) {
        console.error('[ExploreView] load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const list = useMemo(() => {
    const rows = category === 'all' ? recipes : recipes.filter(r => r.category === category)
    const byName = (a: any, b: any) => a.name_en.localeCompare(b.name_en)
    return [...rows].sort(sort === 'name'
      ? byName
      : (a, b) => Number(!!b.is_popular) - Number(!!a.is_popular) || byName(a, b))
  }, [recipes, category, sort])

  const handleToggleSave = async (recipeId: string) => {
    if (!userId) {
      setShowAuth(true)
      return
    }
    const wasSaved = savedIds.has(recipeId)
    const flip = (on: boolean) => setSavedIds(prev => {
      const next = new Set(prev)
      if (on) next.add(recipeId)
      else next.delete(recipeId)
      return next
    })
    flip(!wasSaved)
    try {
      await toggleSaveRecipe(recipeId, userId, wasSaved)
    } catch {
      flip(wasSaved)
    }
  }

  return (
    <div>
      <div style={{ padding: '52px 20px 16px' }}>
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

      {/* 탭·개수·정렬은 위에 붙여 둔다 — 목록을 내려도 다른 카테고리로 바로 옮길 수 있다 */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'var(--kp-bg)',
        padding: '8px 0 0',
        borderBottom: '1px solid rgba(231, 229, 228, 0.6)',
      }}>
        <CategoryTabs selected={category} onChange={setCategory} counts={{ all: recipes.length }} />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px 10px',
        }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
            {loading ? '' : `${list.length} Recipe${list.length === 1 ? '' : 's'}`}
          </span>
          <div role="group" aria-label="Sort" style={{ display: 'flex', gap: 2 }}>
            {(['popular', 'name'] as const).map(s => (
              <button
                key={s}
                type="button"
                aria-pressed={sort === s}
                onClick={() => setSort(s)}
                style={{
                  padding: '4px 8px',
                  border: 'none',
                  borderRadius: 8,
                  background: sort === s ? 'var(--kp-surface-muted)' : 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: sort === s ? 600 : 400,
                  color: sort === s ? '#1A1A1A' : '#78716C',
                  cursor: 'pointer',
                }}
              >
                {s === 'popular' ? 'Popular' : 'A–Z'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'Inter, sans-serif', color: '#9E9E9E' }}>
          Loading recipes...
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map(r => {
            const saved = savedIds.has(r.id)
            return (
              <li key={r.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#FFFFFF',
                border: '1px solid #F5F5F4',
                borderRadius: 14,
                boxShadow: '0 1px rgba(0,0,0,0.05)',
              }}>
                <Link href={`/kpantry/en/recipes/${r.slug}`} style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 10,
                  textDecoration: 'none',
                }}>
                  <span style={{
                    width: 72,
                    height: 72,
                    flexShrink: 0,
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: 'var(--kp-surface-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {r.hero_image_url ? (
                      <img src={r.hero_image_url} alt="" loading="lazy" width={72} height={72}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <UtensilsCrossed size={24} {...PLACEHOLDER_ICON} />
                    )}
                  </span>
                  <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#1C1917',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {r.name_en}
                    </span>
                    {r.name_ko && (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#A8A29E' }}>
                        {r.name_ko}
                      </span>
                    )}
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#78716C', marginTop: 2 }}>
                      {r.cooking_time_min != null && <><Clock {...META_ICON} />{r.cooking_time_min} min</>}
                      {r.calories != null && <span style={{ marginLeft: 10 }}><Flame {...META_ICON} />{r.calories} kcal</span>}
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  aria-pressed={saved}
                  aria-label={saved ? `Remove ${r.name_en} from saved` : `Save ${r.name_en}`}
                  onClick={() => handleToggleSave(r.id)}
                  style={{
                    width: 44,
                    height: 44,
                    marginRight: 6,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                  }}
                >
                  <Bookmark
                    size={20}
                    strokeWidth={1.75}
                    color={saved ? '#C8102E' : '#A8A29E'}
                    fill={saved ? '#C8102E' : 'none'}
                  />
                </button>
              </li>
            )
          })}
        </ul>
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
