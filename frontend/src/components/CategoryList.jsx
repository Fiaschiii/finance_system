import { useState } from 'react'
import { useToast } from '../hooks/useToast.jsx'
import CategoryForm from './CategoryForm.jsx'

// Lista de categorias. Editar abre o formulário no lugar da linha;
// excluir pede uma confirmação na própria linha (sem janela do navegador).
function CategoryList({ categories, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const toast = useToast()

  async function handleUpdate(id, values) {
    await onUpdate(id, values)
    setEditingId(null)
    toast('Categoria atualizada.')
  }

  async function handleDelete(id) {
    setActionError('')
    setBusyId(id)
    try {
      await onDelete(id)
      setConfirmingId(null)
      toast('Categoria excluída.')
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (categories.length === 0) {
    return <p className="empty-state">Nenhuma categoria cadastrada ainda.</p>
  }

  return (
    <>
      {actionError && <p className="status status--error">{actionError}</p>}

      <ul className="category-list">
        {categories.map((category) =>
          editingId === category.id ? (
            <li key={category.id} className="category-list__item">
              <CategoryForm
                initialValues={category}
                onSave={(values) => handleUpdate(category.id, values)}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
            <li key={category.id} className="category-list__item">
              <div className="category-list__info">
                <strong>{category.name}</strong>
                {category.description && (
                  <span className="category-list__description">{category.description}</span>
                )}
              </div>

              {confirmingId === category.id ? (
                <span className="row-actions">
                  <span>Excluir?</span>
                  <button
                    type="button"
                    className="link-button link-button--danger"
                    onClick={() => handleDelete(category.id)}
                    disabled={busyId === category.id}
                  >
                    Sim, excluir
                  </button>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setConfirmingId(null)}
                    disabled={busyId === category.id}
                  >
                    Cancelar
                  </button>
                </span>
              ) : (
                <span className="row-actions">
                  <button
                    type="button"
                    className="link-button"
                    aria-label={`Editar ${category.name}`}
                    onClick={() => {
                      setConfirmingId(null)
                      setEditingId(category.id)
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="link-button link-button--danger"
                    aria-label={`Excluir ${category.name}`}
                    onClick={() => {
                      setEditingId(null)
                      setConfirmingId(category.id)
                    }}
                  >
                    Excluir
                  </button>
                </span>
              )}
            </li>
          )
        )}
      </ul>
    </>
  )
}

export default CategoryList
