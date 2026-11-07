import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { translateAuthError } from '../utils/authErrors.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

function ForgotPassword() {
  usePageTitle('Esqueci minha senha')
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
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
        <p className="auth-links"><Link to="/login">Voltar para o login</Link></p>
      </section>
    )
  }

  return (
    <section className="page page--auth">
      <h1>Esqueci minha senha</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        {error && <p className="status status--error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar link de recuperação'}
        </button>
      </form>
      <p className="auth-links"><Link to="/login">Voltar para o login</Link></p>
    </section>
  )
}

export default ForgotPassword
