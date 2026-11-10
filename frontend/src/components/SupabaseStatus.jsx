import { useEffect, useState } from 'react'
import { getLanguage, useI18n } from '../i18n/index.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function SupabaseStatus() {
  const { t } = useI18n()
  const [state, setState] = useState({ loading: true })

  useEffect(() => {
    fetch(`${API_URL}/api/health/supabase`, { headers: { 'Accept-Language': getLanguage() } })
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
    return <p className="status status--pending">{t('status.checking')}</p>
  }

  if (state.fetchFailed) {
    return (
      <p className="status status--error">{t('status.backendDown', { url: API_URL })}</p>
    )
  }

  if (state.rateLimited) {
    return <p className="status status--warning">{state.error}</p>
  }

  if (!state.configured) {
    return (
      <p className="status status--warning">{t('status.notConfigured')}</p>
    )
  }

  if (state.reachable) {
    return <p className="status status--ok">{t('status.connected')}</p>
  }

  return (
    <p className="status status--error">
      {t('status.unreachable', {
        details: `${state.httpStatus ? ` (HTTP ${state.httpStatus})` : ''}${state.error ? `: ${state.error}` : ''}`,
      })}
    </p>
  )
}

export default SupabaseStatus