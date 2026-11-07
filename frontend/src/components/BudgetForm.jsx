import { useState } from 'react'
import { formatInputBRL, parseBRL } from '../utils/currency.js'

// Formulário de caixinha, usado para criar e para editar.
// Ao criar, escolhe a categoria; ao editar (initialValues presente), só o
// limite pode mudar — a categoria e o mês identificam a caixinha.
function BudgetForm({ categories, initialValues, onSave, onCancel }) {
  const isEditing = Boolean(initialValues)
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? '')
  const [limit, setLimit] = useState(initialValues ? formatInputBRL(initialValues.limit_amount) : '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!isEditing && !categoryId) {
      setError('Escolha uma categoria.')
      return
    }

    const value = parseBRL(limit)
    if (Number.isNaN(value) || value < 0) {
      setError('Informe um limite válido, por exemplo 300,00.')
      return
    }

    const limitAmount = Math.round(value * 100) / 100

    setSaving(true)
    try {
      await onSave(isEditing ? { limit_amount: limitAmount } : { category_id: categoryId, limit_amount: limitAmount })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="budget-form" onSubmit={handleSubmit}>
      {!isEditing && (
        <label>
          Categoria
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} autoFocus>
            <option value="">Selecionar categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        Limite mensal
        <span className="salary-input">
          <span aria-hidden="true">R$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="300,00"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            autoFocus={isEditing}
          />
        </span>
      </label>

      {error && <p className="status status--error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="button" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar caixinha'}
        </button>
        <button type="button" className="button button--ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default BudgetForm
