import { createClient } from '@/lib/supabase/client'

export type SavedPattern = {
  id: string
  pattern_id: string
  episode_id: string
  created_at: string
}

export async function getSavedPatterns(): Promise<SavedPattern[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('kpatto_saved_patterns')
    .select('id, pattern_id, episode_id, created_at')
    .order('created_at', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function savePattern(patternId: string, episodeId: string): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { error } = await supabase
    .from('kpatto_saved_patterns')
    .insert({ user_id: user.id, pattern_id: patternId, episode_id: episodeId })
  return !error
}

export async function unsavePattern(patternId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('kpatto_saved_patterns')
    .delete()
    .eq('pattern_id', patternId)
  return !error
}

export async function isPatternSaved(patternId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('kpatto_saved_patterns')
    .select('id')
    .eq('pattern_id', patternId)
    .maybeSingle()
  return !!data
}
