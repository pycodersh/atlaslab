'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DishCarousel from '@/components/kpantry/dishes/DishCarousel'
import SelectedDish from '@/components/kpantry/dishes/SelectedDish'
import { createClient } from '@/lib/kpantry/supabase'
import { saveSelectedDish, getSelectedDish, SelectedDish as SelectedDishType } from '@/lib/kpantry/dishes'

const DISH_CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'rice', label: 'Rice & Noodles' },
  { key: 'stews', label: 'Soups & Stews' },
  { key: 'meat', label: 'Meat' },
  { key: 'vegetables', label: 'Vegetables' },
  { key: 'street_food', label: 'Street Food' },
]

export default function DishesPage() {
  const router = useRouter()
  const [dishes, setDishes] = useState<any[]>([])
  const [allDishes, setAllDishes] = useState<any[]>([])
  const [category, setCategory] = useState('all')
  const [selectedDish, setSelectedDish] = useState<SelectedDishType | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('pantry_recipes')
        .select('id, slug, name_en, name_ko, description, category, cooking_time_min, difficulty, calories, hero_image_url')
        .order('name_en')
      setAllDishes(data ?? [])
      setDishes(data ?? [])

      const saved = getSelectedDish()
      if (saved) setSelectedDish(saved)
    }
    load()
  }, [])

  useEffect(() => {
    let filtered = allDishes
    if (category !== 'all') {
      filtered = filtered.filter(d =>
        category === 'rice' ? ['rice', 'noodles'].includes(d.category) : d.category === category
      )
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(d =>
        d.name_en.toLowerCase().includes(q) ||
        d.name_ko?.includes(q)
      )
    }
    setDishes(filtered)
  }, [category, searchQuery, allDishes])

  const handleSelect = (dish: any) => {
    const selected: SelectedDishType = {
      id: dish.id,
      slug: dish.slug,
      nameEn: dish.name_en,
      nameKo: dish.name_ko,
      cookingTimeMin: dish.cooking_time_min,
      difficulty: dish.difficulty,
      description: dish.description,
      heroImageUrl: dish.hero_image_url,
    }
    saveSelectedDish(selected)
    setSelectedDish(selected)
  }

  const handleClear = () => {
    setSelectedDish(null)
    localStorage.removeItem('kpantry-selected-dish')
    saveSelectedDish(null as unknown as SelectedDishType)
  }

  return (
    <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', paddingBottom: 40 }}>
      <div style={{
        padding: '52px 20px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            backgroundColor: '#FFFFFF', border: '1px solid #E8E0D0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9L11 14" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: 0,
        }}>
          I Want to Cook
        </h1>

        <button
          onClick={handleClear}
          style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6B6B6B',
            background: 'none', border: '1px solid #E8E0D0', borderRadius: 20,
            padding: '6px 12px', cursor: 'pointer',
          }}
        >
          ↺ Clear
        </button>
      </div>

      <p style={{
        fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9E9E9E',
        textAlign: 'center', margin: '0 0 16px',
      }}>
        Choose a dish you'd like to make.
      </p>

      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          backgroundColor: '#FFFFFF', borderRadius: 14,
          padding: '12px 16px', border: '1px solid #E8E0D0',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#9E9E9E" strokeWidth="1.3"/>
            <path d="M11 11L14 14" stroke="#9E9E9E" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search dishes (e.g. Bulgogi, Bibimbap...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontFamily: 'Inter, sans-serif', fontSize: 14,
              color: '#1A1A1A', backgroundColor: 'transparent',
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto',
        padding: '0 16px 16px', scrollbarWidth: 'none',
      }}>
        {DISH_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: 20,
              backgroundColor: category === cat.key ? '#C4622D' : '#FFFFFF',
              color: category === cat.key ? '#FFFFFF' : '#6B6B6B',
              fontFamily: 'Inter, sans-serif', fontSize: 13,
              fontWeight: category === cat.key ? 600 : 400,
              cursor: 'pointer',
              border: category === cat.key ? 'none' : '1px solid #E8E0D0',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {dishes.length > 0 ? (
        <DishCarousel dishes={dishes} onSelect={handleSelect} />
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#9E9E9E' }}>
            No dishes found.
          </p>
        </div>
      )}

      {selectedDish && (
        <SelectedDish
          dish={selectedDish}
          onChange={() => { setSelectedDish(null); localStorage.removeItem('kpantry-selected-dish') }}
        />
      )}
    </div>
  )
}
