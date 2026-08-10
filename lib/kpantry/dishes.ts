const SELECTED_DISH_KEY = 'kpantry-selected-dish'

export interface SelectedDish {
  id: string
  slug: string
  nameEn: string
  nameKo: string
  cookingTimeMin: number
  difficulty: string
  description: string
  heroImageUrl?: string
}

export function getSelectedDish(): SelectedDish | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SELECTED_DISH_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function saveSelectedDish(dish: SelectedDish) {
  localStorage.setItem(SELECTED_DISH_KEY, JSON.stringify(dish))
}

export function clearSelectedDish() {
  localStorage.removeItem(SELECTED_DISH_KEY)
}
