import { useState } from 'react'
import { formatInputBRL, parseBRL } from '../utils/currency.js'

function SalaryForm({ monthLabel, initialValue, onSave, onCancel }) {
  // Salário 0 significa "ainda não informado" (é o que nasce quando o primeiro gasto do mês
  // é lançado antes do salário): o campo abre vazio, senão quem digita 1200 forma "0,001200".
  const [text, setText] = useState(initialValue ? formatInputBRL(initialValue) : '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const salary = parseBRL(text)
    if (Number.isNaN(salary)) {
      setError('Informe um valor válido, por exemplo 1.200,00.')
      return
    }

    setSaving(true)
    try {
      await onSave(Math.round(salary * 100) / 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="salary-form" onSubmit={handleSubmit}>
      <label>
        Salário de {monthLabel}
        <span className="salary-input">
          <span aria-hidden="true">R$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="1.200,00"
            value={text}
            onChange={(event) => setText(event.target.value)}
            autoFocus
          />
        </span>
      </label>

      {error && <p className="status status--error">{error}</p>}

      <div className="salary-form__actions">
        <button type="submit" className="button" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar salário'}
        </button>
        {onCancel && (
          <button type="button" className="button button--ghost" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default SalaryForm
