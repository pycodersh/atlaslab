'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useTrainerSafe } from '@/contexts/TrainerContext'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({ user: null, session: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, loading: true })
  const trainer    = useTrainerSafe()
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
        setTimeout(() => trainer?.showMessage('Welcome back.', 2500), 600)
      }
      prevUserRef.current = newUser
      setState({ user: newUser, session, loading: false })
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
