import { useState } from 'react'
import { useToast } from '../hooks/useToast.jsx'
import BudgetForm from './BudgetForm.jsx'
import { formatBRL } from '../utils/currency.js'

// Lista de caixinhas em cartões, cada um com uma barra de progresso do gasto
// em relação ao limite. Editar troca o cartão pelo formulário (só o limite
// muda); excluir pede confirmação no próprio cartão.
function BudgetList({ budgets, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const toast = useToast()

  async function handleUpdate(id, values) {
    await onUpdate(id, values)
    setEditingId(null)
    toast('Caixinha atualizada.')
  }

  async function handleDelete(id) {
    setActionError('')
    setBusyId(id)
    try {
      await onDelete(id)
      setConfirmingId(null)
      toast('Caixinha excluída.')
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (budgets.length === 0) {
    return <p className="empty-state">Nenhuma caixinha criada para este mês ainda.</p>
  }

  return (
    <>
      {actionError && <p className="status status--error">{actionError}</p>}

      <ul className="budget-list">
        {budgets.map((budget) => {
          if (editingId === budget.id) {
            return (
              <li key={budget.id} className="budget-list__item">
                <BudgetForm
                  initialValues={budget}
                  onSave={(values) => handleUpdate(budget.id, values)}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            )
          }

          const over = budget.spent > budget.limit_amount
          const percent =
            budget.limit_amount > 0
              ? Math.min(100, Math.round((budget.spent / budget.limit_amount) * 100))
              : budget.spent > 0
                ? 100
                : 0

          return (
            <li key={budget.id} className="budget-list__item">
              <div className="budget-list__header">
                <strong>{budget.category.name}</strong>

                {confirmingId === budget.id ? (
                  <span className="row-actions">
                    <span>Excluir?</span>
                    <button
                      type="button"
                      className="link-button link-button--danger"
                      onClick={() => handleDelete(budget.id)}
                      disabled={busyId === budget.id}
                    >
                      Sim, excluir
                    </button>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => setConfirmingId(null)}
                      disabled={busyId === budget.id}
                    >
                      Cancelar
                    </button>
                  </span>
                ) : (
                  <span className="row-actions">
                    <button
                      type="button"
                      className="link-button"
                      aria-label={`Editar caixinha de ${budget.category.name}`}
                      onClick={() => {
                        setConfirmingId(null)
                        setEditingId(budget.id)
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="link-button link-button--danger"
                      aria-label={`Excluir caixinha de ${budget.category.name}`}
                      onClick={() => {
                        setEditingId(null)
                        setConfirmingId(budget.id)
                      }}
                    >
                      Excluir
                    </button>
                  </span>
                )}
              </div>

              <div className="budget-bar">
                <div
                  className={`budget-bar__fill${over ? ' budget-bar__fill--over' : ''}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <p className={`budget-list__amounts${over ? ' budget-list__amounts--over' : ''}`}>
                {formatBRL(budget.spent)} de {formatBRL(budget.limit_amount)}
              </p>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default BudgetList
