'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({ user: null, session: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, loading: true })
  const prevUserRef = useRef<User | null | undefined>(undefined)  // undefined = not yet loaded

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, loading: false })
      prevUserRef.current = session?.user ?? null
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null
      const wasLoggedOut = prevUserRef.current === null
      const isNowLoggedIn = newUser !== null
      if (wasLoggedOut && isNowLoggedIn && prevUserRef.current !== undefined) {
        // Set flag so home page can show "Welcome back." before "Ready?"
        localStorage.setItem('patto_just_logged_in', '1')
      }
      prevUserRef.current = newUser
      setState({ user: newUser, session, loading: false })
    })

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
