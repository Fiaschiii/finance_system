import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../services/api.js'

// Gastos de um mês. Só carrega quando mês e ano já são conhecidos.
// Depois de criar, editar ou excluir, busca a lista de novo (em silêncio):
// assim a ordem, a categoria e os totais vêm sempre do servidor.
export function useExpenses(month, year) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!month || !year) return
      if (!silent) {
        setLoading(true)
        setError('')
      }
      try {
        const data = await apiFetch(`/api/expenses?month=${month}&year=${year}`)
        setExpenses(data.expenses)
        setError('')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [month, year]
  )

  useEffect(() => {
    load()
  }, [load])

  // As três funções lançam o erro para quem chamou mostrar a mensagem.
  const addExpense = useCallback(
    async (values) => {
      await apiFetch('/api/expenses', { method: 'POST', body: JSON.stringify(values) })
      await load({ silent: true })
    },
    [load]
  )

  const updateExpense = useCallback(
    async (id, values) => {
      await apiFetch(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(values) })
      await load({ silent: true })
    },
    [load]
  )

  const deleteExpense = useCallback(
    async (id) => {
      await apiFetch(`/api/expenses/${id}`, { method: 'DELETE' })
      await load({ silent: true })
    },
    [load]
  )

  return { expenses, loading, error, addExpense, updateExpense, deleteExpense, reload: load }
}
