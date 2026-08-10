import { createClient } from '@/lib/kpantry/supabase'

export async function signUp(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signUp({ email, password })
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
