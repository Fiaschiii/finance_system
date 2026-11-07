import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { translateAuthError } from '../utils/authErrors.js'

function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    const { data, error } = await signUp(email, password)
    setLoading(false)

    if (error) {
      setError(translateAuthError(error.message))
      return
    }

    if (data.session) {
      navigate('/')
      return
    }

    setInfo('Conta criada! Confira seu e-mail para confirmar o cadastro antes de entrar.')
  }

  return (
    <section className="page page--auth">
      <h1>Criar conta</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </label>
        {error && <p className="status status--error">{error}</p>}
        {info && <p className="status status--ok">{info}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Criando…' : 'Criar conta'}
        </button>
      </form>
      <p className="auth-links">
        <Link to="/login">Já tenho conta</Link>
      </p>
    </section>
  )
}

export default Register
