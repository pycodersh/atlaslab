'use client'

import { createClient } from '@/lib/supabase/client'

const CALLBACK = () =>
  typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : '/auth/callback'

export async function signInWithGoogle() {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: CALLBACK() },
  })
  return error?.message ?? null
}

export async function signInWithKakao() {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: { redirectTo: CALLBACK() },
  })
  return error?.message ?? null
}

export async function signInWithEmail(email: string, password: string, isSignUp: boolean) {
  const supabase = createClient()
  if (isSignUp) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: CALLBACK() },
    })
    return error?.message ?? null
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return error?.message ?? null
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return error?.message ?? null
}

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
