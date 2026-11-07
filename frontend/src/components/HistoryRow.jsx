import { useState } from 'react'
import { useExpenses } from '../hooks/useExpenses.js'
import SalaryForm from './SalaryForm.jsx'
import ExpenseForm from './ExpenseForm.jsx'
import ExpenseList from './ExpenseList.jsx'
import { formatBRL, subtractMoney } from '../utils/currency.js'
import { formatMonthYear, monthRange } from '../utils/date.js'

// Uma linha do Histórico. Clicar no mês expande os gastos daquele período
// (criar/editar/excluir, como no Dashboard); o salário tem edição inline.
// Só busca os gastos do mês quando a linha é expandida.
function HistoryRow({ item, categories, onSaveSalary, onChanged }) {
  const [editingSalary, setEditingSalary] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [addingExpense, setAddingExpense] = useState(false)

  const expensesState = useExpenses(expanded ? item.month : null, expanded ? item.year : null)

  const monthLabel = formatMonthYear(item.month, item.year)
  const dateRange = monthRange(item.month, item.year)
  const balance = subtractMoney(item.salary, item.totalSpent)

  async function handleSaveSalary(salary) {
    await onSaveSalary(item.id, salary)
    setEditingSalary(false)
  }

  async function handleAddExpense(values) {
    await expensesState.addExpense(values)
    onChanged()
    setAddingExpense(false)
  }

  async function handleUpdateExpense(id, values) {
    await expensesState.updateExpense(id, values)
    onChanged()
  }

  async function handleDeleteExpense(id) {
    await expensesState.deleteExpense(id)
    onChanged()
  }

  return (
    <>
      <tr>
        <td>
          <button
            type="button"
            className="history-month-toggle"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? '▾' : '▸'} {monthLabel}
          </button>
        </td>
        <td className="num">
          <div className="history-salary">
            <span>{formatBRL(item.salary)}</span>
            {!editingSalary && (
              <button type="button" className="link-button" onClick={() => setEditingSalary(true)}>
                Editar
              </button>
            )}
          </div>
        </td>
        <td className="num">{formatBRL(item.totalSpent)}</td>
        <td className={`num${balance < 0 ? ' num--negative' : ''}`}>{formatBRL(balance)}</td>
      </tr>

      {editingSalary && (
        <tr>
          <td colSpan={4}>
            <SalaryForm
              monthLabel={monthLabel}
              initialValue={item.salary}
              onSave={handleSaveSalary}
              onCancel={() => setEditingSalary(false)}
            />
          </td>
        </tr>
      )}

      {expanded && (
        <tr>
          <td colSpan={4}>
            {expensesState.loading && <p className="status status--pending">Carregando…</p>}
            {expensesState.error && <p className="status status--error">{expensesState.error}</p>}

            {!expensesState.loading && !expensesState.error && (
              <>
                <div className="section-header">
                  <h3>Gastos de {monthLabel}</h3>
                  {!addingExpense && (
                    <button type="button" className="button" onClick={() => setAddingExpense(true)}>
                      + Adicionar gasto
                    </button>
                  )}
                </div>

                {addingExpense && (
                  <ExpenseForm
                    categories={categories}
                    dateRange={dateRange}
                    defaultDate={dateRange.min}
                    monthLabel={monthLabel}
                    onSave={handleAddExpense}
                    onCancel={() => setAddingExpense(false)}
                  />
                )}

                <ExpenseList
                  expenses={expensesState.expenses}
                  categories={categories}
                  dateRange={dateRange}
                  monthLabel={monthLabel}
                  onUpdate={handleUpdateExpense}
                  onDelete={handleDeleteExpense}
                />
              </>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export default HistoryRow
