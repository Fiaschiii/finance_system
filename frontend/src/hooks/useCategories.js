import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../services/api.js'

// Categorias do usuário (para o seletor do formulário de gastos).
// Somente leitura por enquanto; criar/editar/excluir chega na Etapa 7.
export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/api/categories')
      setCategories(data.categories)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { categories, loading, error, reload: load }
}
