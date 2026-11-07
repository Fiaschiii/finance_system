import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useRouteReady } from '../hooks/useRouteLoading.jsx'
import { translateAuthError } from '../utils/authErrors.js'
import { normalizeCode } from '../utils/mfa.js'
import TotpCodeInput from '../components/TotpCodeInput.jsx'

// Segundo passo do login: a senha já foi aceita, falta o código de 6 dígitos
// do app autenticador. Só aparece para quem ativou a verificação em duas
// etapas (em Configurações).
function MfaVerify() {
  usePageTitle('Verificação em duas etapas')
  const { user, loading, mfaPending } = useAuth()

  if (loading) {
    return <span className="visually-hidden">Carregando…</span>
  }
  if (!user) return <Navigate to="/login" replace />
  if (!mfaPending) return <Navigate to="/" replace />

  return <MfaVerifyForm />
}

function MfaVerifyForm() {
  const { listFactors, verifyTotp, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [factorId, setFactorId] = useState(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  useRouteReady(factorId !== null || error !== '')

  useEffect(() => {
    let active = true
    listFactors().then(({ data, error: listError }) => {
      if (!active) return
      // data.totp traz só os apps já confirmados.
      const factor = data?.totp?.[0]
      if (listError || !factor) {
        setError(listError ? translateAuthError(listError.message) : 'Nenhum app autenticador encontrado.')
        return
      }
      setFactorId(factor.id)
    })
    return () => {
      active = false
    }
  }, [listFactors])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: verifyError } = await verifyTotp(factorId, normalizeCode(code))
    setSubmitting(false)
    if (verifyError) {
      setError(translateAuthError(verifyError.message))
      setCode('')
      return
    }
    navigate(location.state?.from?.pathname ?? '/', { replace: true })
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <section className="page page--auth">
      <h1>Verificação em duas etapas</h1>
      <p>Abra o seu app autenticador (por exemplo, o Microsoft Authenticator) e digite o código de 6 dígitos de “Controle Financeiro”.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <TotpCodeInput value={code} onChange={setCode} autoFocus />
        {error && <p className="status status--error">{error}</p>}
        <button type="submit" disabled={submitting || !factorId || normalizeCode(code).length !== 6}>
          {submitting ? 'Verificando…' : 'Verificar'}
        </button>
      </form>
      <p className="auth-links">
        <button type="button" className="link-button" onClick={handleSignOut}>
          Entrar com outra conta
        </button>
      </p>
    </section>
  )
}

export default MfaVerify
