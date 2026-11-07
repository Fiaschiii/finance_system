import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useFinance } from '../hooks/useFinance.js'
import { useCategories } from '../hooks/useCategories.js'
import { useExpenses } from '../hooks/useExpenses.js'
import { useBudgets } from '../hooks/useBudgets.js'
import { formatBRL, sumMoney, subtractMoney } from '../utils/currency.js'
import { formatMonthYear, monthRange, toISODate } from '../utils/date.js'
import DashboardCard from '../components/DashboardCard.jsx'
import SalaryForm from '../components/SalaryForm.jsx'
import ExpenseForm from '../components/ExpenseForm.jsx'
import ExpenseList from '../components/ExpenseList.jsx'
import BudgetForm from '../components/BudgetForm.jsx'
import BudgetList from '../components/BudgetList.jsx'
import CategoryChart from '../components/CategoryChart.jsx'
import SupabaseStatus from '../components/SupabaseStatus.jsx'

function Dashboard() {
  const { user } = useAuth()
  const financeState = useFinance()
  const { month, year, finance } = financeState
  const categoriesState = useCategories()
  const expensesState = useExpenses(month, year)
  const budgetsState = useBudgets(month, year)

  const [editingSalary, setEditingSalary] = useState(false)
  const [addingExpense, setAddingExpense] = useState(false)
  const [addingBudget, setAddingBudget] = useState(false)

  const error =
    financeState.error || categoriesState.error || expensesState.error || budgetsState.error
  const loading =
    !error &&
    (financeState.loading || categoriesState.loading || expensesState.loading || budgetsState.loading)
  const ready = !error && !loading

  const monthLabel = month && year ? formatMonthYear(month, year) : ''
  const dateRange = month && year ? monthRange(month, year) : null

  // Data sugerida no formulário: hoje, se estiver dentro do mês exibido.
  const today = toISODate()
  const defaultDate = dateRange && today >= dateRange.min && today <= dateRange.max ? today : dateRange?.min

  const totalSpent = sumMoney(expensesState.expenses.map((expense) => expense.amount))
  const balance = subtractMoney(finance?.salary ?? 0, totalSpent)
  const hasCategories = categoriesState.categories.length > 0
  const categoriesWithoutBudget = categoriesState.categories.filter(
    (category) => !budgetsState.budgets.some((budget) => budget.category_id === category.id)
  )

  const fixedTotal = sumMoney(
    expensesState.expenses.filter((expense) => expense.type === 'fixo').map((expense) => expense.amount)
  )
  const variableTotal = sumMoney(
    expensesState.expenses.filter((expense) => expense.type === 'variavel').map((expense) => expense.amount)
  )
  const spentPercent =
    finance && finance.salary > 0 ? Math.round((totalSpent / finance.salary) * 100) : null
  const overBudgetCategories = budgetsState.budgets.filter((budget) => budget.spent > budget.limit_amount)

  function reloadAll() {
    financeState.reload()
    categoriesState.reload()
    expensesState.reload()
    budgetsState.reload()
  }

  async function handleSaveSalary(salary) {
    await financeState.saveSalary(salary)
    setEditingSalary(false)
  }

  async function handleAddExpense(values) {
    await expensesState.addExpense(values)
    // Se o mês ainda não tinha registro, o backend criou um com salário 0:
    // atualiza o estado para o cartão do salário aparecer.
    if (!finance) {
      await financeState.reload({ silent: true })
    }
    setAddingExpense(false)
  }

  async function handleAddBudget(values) {
    await budgetsState.addBudget(values)
    setAddingBudget(false)
  }

  return (
    <section className="page page--wide">
      <h1>Olá, {user?.email}</h1>
      {monthLabel && <h2 className="page__subtitle">Resumo de {monthLabel}</h2>}

      {loading && <p className="status status--pending">Carregando…</p>}

      {error && (
        <div className="dashboard-panel">
          <p className="status status--error">{error}</p>
          <button type="button" className="button button--ghost" onClick={reloadAll}>
            Tentar de novo
          </button>
        </div>
      )}

      {ready && (
        <>
          {(editingSalary || !finance) && (
            <div className="dashboard-panel">
              <h3 className="dashboard-panel__title">
                {finance ? 'Editar salário' : 'Você ainda não cadastrou o salário deste mês.'}
              </h3>
              <SalaryForm
                monthLabel={monthLabel}
                initialValue={finance?.salary ?? null}
                onSave={handleSaveSalary}
                onCancel={finance ? () => setEditingSalary(false) : undefined}
              />
            </div>
          )}

          {finance && (
            <div className="dashboard-cards">
              <DashboardCard label="Salário" value={formatBRL(finance.salary)}>
                {!editingSalary && (
                  <button
                    type="button"
                    className="link-button"
                    aria-label={finance.salary === 0 ? undefined : 'Editar salário'}
                    onClick={() => setEditingSalary(true)}
                  >
                    {finance.salary === 0 ? 'Informar salário' : 'Editar'}
                  </button>
                )}
              </DashboardCard>
              <DashboardCard label="Gastos" value={formatBRL(totalSpent)} />
              <DashboardCard
                label="Saldo"
                value={formatBRL(balance)}
                tone={balance < 0 ? 'negative' : undefined}
              />
              <DashboardCard label="Gastos fixos" value={formatBRL(fixedTotal)} />
              <DashboardCard label="Gastos variáveis" value={formatBRL(variableTotal)} />
              {spentPercent !== null && (
                <DashboardCard
                  label="% do salário gasto"
                  value={`${spentPercent}%`}
                  tone={spentPercent > 100 ? 'negative' : undefined}
                />
              )}
            </div>
          )}

          {overBudgetCategories.length > 0 && (
            <p className="status status--error">
              Caixinha estourada: {overBudgetCategories.map((budget) => budget.category.name).join(', ')}.
            </p>
          )}

          <div className="section-header">
            <h3>Gastos por categoria</h3>
          </div>
          <div className="chart-panel">
            <CategoryChart expenses={expensesState.expenses} />
          </div>

          <div className="section-header">
            <h3>Caixinhas do mês</h3>
            {hasCategories && categoriesWithoutBudget.length > 0 && !addingBudget && (
              <button type="button" className="button" onClick={() => setAddingBudget(true)}>
                + Nova caixinha
              </button>
            )}
          </div>

          {addingBudget && (
            <BudgetForm
              categories={categoriesWithoutBudget}
              onSave={handleAddBudget}
              onCancel={() => setAddingBudget(false)}
            />
          )}

          <BudgetList
            budgets={budgetsState.budgets}
            onUpdate={budgetsState.updateBudget}
            onDelete={budgetsState.deleteBudget}
          />

          <div className="section-header">
            <h3>Gastos do mês</h3>
            {hasCategories && !addingExpense && (
              <button type="button" className="button" onClick={() => setAddingExpense(true)}>
                + Adicionar gasto
              </button>
            )}
          </div>

          {!hasCategories && (
            <p className="status status--warning">
              Nenhuma categoria encontrada para a sua conta. Rode o script
              database/migrations/0002_backfill_default_categories.sql no SQL Editor do Supabase
              (veja o database/README.md) e recarregue a página.
            </p>
          )}

          {addingExpense && (
            <ExpenseForm
              categories={categoriesState.categories}
              dateRange={dateRange}
              defaultDate={defaultDate}
              monthLabel={monthLabel}
              onSave={handleAddExpense}
              onCancel={() => setAddingExpense(false)}
            />
          )}

          <ExpenseList
            expenses={expensesState.expenses}
            categories={categoriesState.categories}
            dateRange={dateRange}
            monthLabel={monthLabel}
            onUpdate={expensesState.updateExpense}
            onDelete={expensesState.deleteExpense}
          />
        </>
      )}

      <SupabaseStatus />
    </section>
  )
}

export default Dashboard
