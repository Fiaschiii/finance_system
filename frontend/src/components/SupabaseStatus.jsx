import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function SupabaseStatus() {
  const [state, setState] = useState({ loading: true })

  useEffect(() => {
    fetch(`${API_URL}/api/health/supabase`)
      .then(async (res) => {
        const data = await res.json()
        // Limite de testes de conexão (Etapa 17): não é "Supabase não configurado".
        if (res.status === 429) return setState({ loading: false, rateLimited: true, error: data.error })
        setState({ loading: false, ...data })
      })
      .catch((error) =>
        setState({ loading: false, fetchFailed: true, error: error.message })
      )
  }, [])

  if (state.loading) {
    return <p className="status status--pending">Verificando conexão com o Supabase…</p>
  }

  if (state.fetchFailed) {
    return (
      <p className="status status--error">
        Não consegui falar com o backend em {API_URL}. Confira se ele está
        rodando (npm run dev na pasta backend) e sem erros no terminal.
      </p>
    )
  }

  if (state.rateLimited) {
    return <p className="status status--warning">{state.error}</p>
  }

  if (!state.configured) {
    return (
      <p className="status status--warning">
        Supabase ainda não configurado. Preencha SUPABASE_URL e a chave publishable no backend/.env e no frontend/.env.
      </p>
    )
  }

  if (state.reachable) {
    return <p className="status status--ok">Conectado ao Supabase</p>
  }

  return (
    <p className="status status--error">
      Não consegui alcançar o Supabase
      {state.httpStatus ? ` (HTTP ${state.httpStatus})` : ''}
      {state.error ? `: ${state.error}` : ''}. Confira a URL e a chave em backend/.env.
    </p>
  )
}

export default SupabaseStatus