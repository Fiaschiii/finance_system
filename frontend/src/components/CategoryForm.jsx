import { useState } from 'react'

// Formulário de categoria, usado para criar e para editar.
function CategoryForm({ initialValues, onSave, onCancel }) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Informe o nome da categoria.')
      return
    }

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="category-form" onSubmit={handleSubmit}>
      <label>
        Nome
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
          autoFocus
        />
      </label>

      <label>
        Descrição (opcional)
        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={200}
        />
      </label>

      {error && <p className="status status--error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="button" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar categoria'}
        </button>
        <button type="button" className="button button--ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default CategoryForm
