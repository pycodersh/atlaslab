'use client'

import { createClient } from '@/lib/supabase/client'

const CALLBACK = () =>
  typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : '/auth/callback'

export async function signInWithGoogle() {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: CALLBACK() },
    })
    return error?.message ?? null
  } catch (e) {
    return e instanceof Error ? e.message : '네트워크 오류가 발생했습니다.'
  }
}

export async function signInWithKakao() {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: CALLBACK(),
        // Kakao Developer Console: profile_nickname, profile_image, account_email
        // all set to 선택 동의. Request them explicitly — Supabase's default
        // sends the legacy `profile` scope which can trigger KOE205.
        scopes: 'profile_nickname profile_image account_email',
      },
    })
    return error?.message ?? null
  } catch (e) {
    return e instanceof Error ? e.message : '네트워크 오류가 발생했습니다.'
  }
}

export async function signInWithEmail(email: string, password: string, isSignUp: boolean) {
  try {
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
  } catch (e) {
    return e instanceof Error ? e.message : '네트워크 오류가 발생했습니다.'
  }
}

export async function signOut() {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    return error?.message ?? null
  } catch (e) {
    return e instanceof Error ? e.message : '네트워크 오류가 발생했습니다.'
  }
}

export async function getCurrentUser() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}
