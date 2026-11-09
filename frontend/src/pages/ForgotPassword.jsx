import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { translateAuthError } from '../utils/authErrors.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useRouteReady } from '../hooks/useRouteLoading.jsx'
import { useCaptcha } from '../hooks/useCaptcha.jsx'
import { ArrowLeftIcon } from '@primer/octicons-react'

function ForgotPassword() {
  usePageTitle('Esqueci minha senha')
  useRouteReady(true)
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const captcha = useCaptcha()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email, captcha.token)
    setLoading(false)
    captcha.reset()
    if (error) {
      setError(translateAuthError(error.message))
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <section className="page page--auth">
        <h1>Confira seu e-mail</h1>
        <p>Se {email} estiver cadastrado, enviamos um link para redefinir a senha.</p>
        <p className="auth-links"><Link to="/login"><ArrowLeftIcon size={16} /> Voltar para o login</Link></p>
      </section>
    )
  }

  return (
    <section className="page page--auth">
      <h1>Esqueci minha senha</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          E-mail
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        {captcha.widget}
        {error && <p className="status status--error">{error}</p>}
        <button type="submit" disabled={loading || !captcha.ready}>
          {loading ? 'Enviando…' : 'Enviar link de recuperação'}
        </button>
      </form>
      <p className="auth-links"><Link to="/login"><ArrowLeftIcon size={16} /> Voltar para o login</Link></p>
    </section>
  )
}

export default ForgotPassword
