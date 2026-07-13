const LS_KEY = 'patto_my_sentences'

export interface MySentence {
  id: string
  text: string
  source: 'challenge' | 'writing-studio'
  storyId?: number
  createdAt: string
}

function load(): MySentence[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}

function save(items: MySentence[]): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)) } catch {}
}

export function getMySentences(): MySentence[] {
  return load()
}

export function addMySentence(item: Omit<MySentence, 'id' | 'createdAt'>): MySentence {
  const entry: MySentence = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  }
  save([entry, ...load()])
  return entry
}

export function removeMySentence(id: string): void {
  save(load().filter(s => s.id !== id))
}
