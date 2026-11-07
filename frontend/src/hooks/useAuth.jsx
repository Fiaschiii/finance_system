import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabase.js'
import { isMfaPending } from '../utils/mfa.js'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // As funções não dependem da sessão: são criadas uma vez só. Assim dá para
  // usá-las como dependência de useEffect sem disparar buscas à toa.
  const actions = useMemo(
    () => ({
      signUp: (email, password) => supabase.auth.signUp({ email, password }),
      signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
      signOut: () => supabase.auth.signOut(),
      resetPassword: (email) =>
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      updatePassword: (newPassword) => supabase.auth.updateUser({ password: newPassword }),

      // Verificação em duas etapas (app autenticador, TOTP).
      listFactors: () => supabase.auth.mfa.listFactors(),
      enrollTotp: () =>
        supabase.auth.mfa.enroll({
          factorType: 'totp',
          // O nome que aparece no app autenticador, acima do código.
          issuer: 'Controle Financeiro',
          friendlyName: 'App autenticador',
        }),
      verifyTotp: (factorId, code) => supabase.auth.mfa.challengeAndVerify({ factorId, code }),
      // Depois de remover, renova a sessão: a lista de apps guardada nela
      // (que decide se o código é pedido) fica atualizada na hora.
      unenrollFactor: async (factorId) => {
        const result = await supabase.auth.mfa.unenroll({ factorId })
        if (!result.error) await supabase.auth.refreshSession()
        return result
      },
    }),
    []
  )

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      // Entrou com a senha, mas ainda falta o código do app.
      mfaPending: isMfaPending(session),
      ...actions,
    }),
    [session, loading, actions]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider')
  }
  return context
}
