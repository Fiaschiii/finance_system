import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../services/api.js'

// Estado do mês atual: carrega o registro (salário) e permite salvar.
export function useFinance() {
  const [month, setMonth] = useState(null)
  const [year, setYear] = useState(null)
  const [finance, setFinance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/api/finance/current')
      setMonth(data.month)
      setYear(data.year)
      setFinance(data.finance)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Cria o salário do mês (se ainda não existe) ou atualiza o existente.
  // Se falhar, lança o erro para o formulário mostrar a mensagem.
  const saveSalary = useCallback(
    async (salary) => {
      if (finance) {
        const data = await apiFetch(`/api/finance/${finance.id}`, {
          method: 'PUT',
          body: JSON.stringify({ salary }),
        })
        setFinance(data.finance)
      } else {
        const data = await apiFetch('/api/finance', {
          method: 'POST',
          body: JSON.stringify({ month, year, salary }),
        })
        setFinance(data.finance)
      }
    },
    [finance, month, year]
  )

  return { month, year, finance, loading, error, saveSalary, reload: load }
}
