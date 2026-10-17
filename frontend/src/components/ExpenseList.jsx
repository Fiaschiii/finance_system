import { useState } from 'react'
import ExpenseForm from './ExpenseForm.jsx'
import { formatBRL } from '../utils/currency.js'
import { formatDayMonth } from '../utils/date.js'
import { typeLabel } from '../utils/expenses.js'

// Tabela de gastos do mês. Editar abre o formulário no lugar da linha;
// excluir pede uma confirmação na própria linha (sem janela do navegador).
function ExpenseList({ expenses, categories, dateRange, monthLabel, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')

  async function handleUpdate(id, values) {
    await onUpdate(id, values)
    setEditingId(null)
  }

  async function handleDelete(id) {
    setActionError('')
    setBusyId(id)
    try {
      await onDelete(id)
      setConfirmingId(null)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (expenses.length === 0) {
    return <p className="empty-state">Nenhum gasto neste mês ainda.</p>
  }

  return (
    <>
      {actionError && <p className="status status--error">{actionError}</p>}

      <div className="table-wrap">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th className="num">Valor</th>
              <th>
                <span className="visually-hidden">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) =>
              editingId === expense.id ? (
                <tr key={expense.id}>
                  <td colSpan={6}>
                    <ExpenseForm
                      categories={categories}
                      dateRange={dateRange}
                      defaultDate={expense.expense_date}
                      monthLabel={monthLabel}
                      initialValues={expense}
                      onSave={(values) => handleUpdate(expense.id, values)}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={expense.id}>
                  <td>{formatDayMonth(expense.expense_date)}</td>
                  <td>
                    {expense.description}
                    {expense.notes && <span className="expense-note">{expense.notes}</span>}
                  </td>
                  <td>{expense.category?.name ?? '—'}</td>
                  <td>
                    <span className={`type-tag type-tag--${expense.type}`}>{typeLabel(expense.type)}</span>
                  </td>
                  <td className="num">{formatBRL(expense.amount)}</td>
                  <td>
                    {confirmingId === expense.id ? (
                      <span className="row-actions">
                        <span>Excluir?</span>
                        <button
                          type="button"
                          className="link-button link-button--danger"
                          onClick={() => handleDelete(expense.id)}
                          disabled={busyId === expense.id}
                        >
                          Sim, excluir
                        </button>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => setConfirmingId(null)}
                          disabled={busyId === expense.id}
                        >
                          Cancelar
                        </button>
                      </span>
                    ) : (
                      <span className="row-actions">
                        <button
                          type="button"
                          className="link-button"
                          aria-label={`Editar ${expense.description}`}
                          onClick={() => {
                            setConfirmingId(null)
                            setEditingId(expense.id)
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="link-button link-button--danger"
                          aria-label={`Excluir ${expense.description}`}
                          onClick={() => {
                            setEditingId(null)
                            setConfirmingId(expense.id)
                          }}
                        >
                          Excluir
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default ExpenseList
