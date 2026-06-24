import { createClient } from '@/lib/supabase/server'
import type { Level } from '@/constants/levels'

export async function getPatternsByLevel(
  languageCode: string,
  level: Level,
  uiLang: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('patterns')
    .select(`
      id,
      level,
      order_index,
      image_id,
      pattern_translations!inner(pattern_text, meaning),
      pattern_images(storage_key)
    `)
    .eq('language_id', languageCode)
    .eq('level', level)
    .eq('pattern_translations.ui_lang', uiLang)
    .eq('is_published', true)
    .order('order_index')

  if (error) throw error
  return data
}
