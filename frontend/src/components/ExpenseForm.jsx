import { useState } from 'react'
import { formatInputBRL, parseBRL } from '../utils/currency.js'
import { EXPENSE_TYPES } from '../utils/expenses.js'

// Formulário de gasto, usado para criar e para editar.
// - dateRange: primeiro/último dia do mês exibido (o gasto fica dentro dele)
// - defaultDate: data sugerida ao criar
// - initialValues: se vier, é edição e os campos começam preenchidos
function ExpenseForm({ categories, dateRange, defaultDate, monthLabel, initialValues, onSave, onCancel }) {
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [amount, setAmount] = useState(initialValues ? formatInputBRL(initialValues.amount) : '')
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? '')
  const [type, setType] = useState(initialValues?.type ?? 'variavel')
  const [date, setDate] = useState(initialValues?.expense_date ?? defaultDate)
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Devolve a primeira mensagem de erro, ou null se está tudo certo.
  function validate() {
    if (!description.trim()) return 'Informe a descrição.'

    const value = parseBRL(amount)
    if (Number.isNaN(value)) return 'Informe um valor válido, por exemplo 55,00.'
    if (value <= 0) return 'O valor precisa ser maior que zero.'

    if (!categoryId) return 'Escolha uma categoria.'

    if (!date || date < dateRange.min || date > dateRange.max) {
      return `Escolha uma data dentro de ${monthLabel}.`
    }
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }

    setSaving(true)
    try {
      await onSave({
        description: description.trim(),
        amount: Math.round(parseBRL(amount) * 100) / 100,
        category_id: categoryId,
        type,
        expense_date: date,
        notes: notes.trim() || null,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <label className="span-2">
        Descrição
        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={120}
          autoFocus
        />
      </label>

      <label>
        Valor
        <span className="salary-input">
          <span aria-hidden="true">R$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </span>
      </label>

      <label>
        Data
        <input
          type="date"
          value={date}
          min={dateRange.min}
          max={dateRange.max}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>

      <label>
        Categoria
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">Selecionar categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend>Tipo</legend>
        <div className="radio-options">
          {EXPENSE_TYPES.map((option) => (
            <label key={option.value} className="radio-option">
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={type === option.value}
                onChange={() => setType(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="span-2">
        Observação (opcional)
        <input
          type="text"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={500}
        />
      </label>

      {error && <p className="status status--error span-2">{error}</p>}

      <div className="form-actions span-2">
        <button type="submit" className="button" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar gasto'}
        </button>
        <button type="button" className="button button--ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default ExpenseForm
