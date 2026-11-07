import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    // A tela de carregamento (AppLoader) já está cobrindo a página.
    return <span className="visually-hidden">Carregando…</span>
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PublicOnlyRoute
