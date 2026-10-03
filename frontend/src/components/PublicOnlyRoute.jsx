import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="status status--pending">Carregando…</p>
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PublicOnlyRoute
