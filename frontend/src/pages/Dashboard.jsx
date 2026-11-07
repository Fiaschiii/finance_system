import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFinance } from '../hooks/useFinance.js'
import { useCategories } from '../hooks/useCategories.js'
import { useExpenses } from '../hooks/useExpenses.js'
import { useBudgets } from '../hooks/useBudgets.js'
import { useToast } from '../hooks/useToast.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { formatBRL, sumMoney, subtractMoney } from '../utils/currency.js'
import { formatMonthYear, monthRange, toISODate, parseMonthParam, toMonthParam } from '../utils/date.js'
import DashboardCard from '../components/DashboardCard.jsx'
import SalaryForm from '../components/SalaryForm.jsx'
import ExpenseForm from '../components/ExpenseForm.jsx'
import ExpenseList from '../components/ExpenseList.jsx'
import BudgetForm from '../components/BudgetForm.jsx'
import BudgetList from '../components/BudgetList.jsx'
import CategoryChart from '../components/CategoryChart.jsx'
import MonthPicker from '../components/MonthPicker.jsx'
import Icon from '../components/Icon.jsx'
import { SkeletonCards, SkeletonRows, LoadingLabel } from '../components/Skeleton.jsx'

// Página "Resumo": o mês exibido vem da URL (?mes=2026-10); sem ela, é o mês
// atual. Assim, recarregar a página ou voltar do Histórico mantém o mês.
function Dashboard() {
  usePageTitle('Resumo')
  const [searchParams, setSearchParams] = useSearchParams()
  const categoriesState = useCategories()

  const now = new Date()
  const current = { month: now.getMonth() + 1, year: now.getFullYear() }
  const selected = parseMonthParam(searchParams.get('mes')) ?? current

  function changeMonth({ month, year }) {
    const isCurrent = month === current.month && year === current.year
    setSearchParams(isCurrent ? {} : { mes: toMonthParam(month, year) })
  }

  return (
    // A key faz o resumo "nascer de novo" a cada mês: formulários abertos
    // fecham e os dados do mês anterior não aparecem nem por um instante.
    <MonthSummary
      key={toMonthParam(selected.month, selected.year)}
      month={selected.month}
      year={selected.year}
      current={current}
      onChangeMonth={changeMonth}
      categoriesState={categoriesState}
    />
  )
}

function MonthSummary({ month, year, current, onChangeMonth, categoriesState }) {
  const toast = useToast()
  const financeState = useFinance(month, year)
  const { finance } = financeState
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

  const monthLabel = formatMonthYear(month, year)
  const dateRange = monthRange(month, year)

  // Data sugerida no formulário: hoje, se estiver dentro do mês exibido.
  const today = toISODate()
  const defaultDate = today >= dateRange.min && today <= dateRange.max ? today : dateRange.min

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
  const salary = Number(finance?.salary ?? 0)
  const spentPercent = salary > 0 ? Math.round((totalSpent / salary) * 100) : null
  const overBudgetCategories = budgetsState.budgets.filter((budget) => budget.spent > budget.limit_amount)

  function reloadAll() {
    financeState.reload()
    categoriesState.reload()
    expensesState.reload()
    budgetsState.reload()
  }

  async function handleSaveSalary(value) {
    await financeState.saveSalary(value)
    setEditingSalary(false)
    toast('Salário salvo.')
  }

  async function handleAddExpense(values) {
    await expensesState.addExpense(values)
    // Se o mês ainda não tinha registro, o backend criou um com salário 0:
    // atualiza o estado para os cartões aparecerem.
    if (!finance) {
      await financeState.reload({ silent: true })
    }
    setAddingExpense(false)
    toast('Gasto adicionado.')
  }

  async function handleAddBudget(values) {
    await budgetsState.addBudget(values)
    setAddingBudget(false)
    toast('Caixinha criada.')
  }

  return (
    <section className="page page--wide">
      <div className="page-header">
        <h1>Resumo do mês</h1>
        <MonthPicker month={month} year={year} current={current} onChange={onChangeMonth} />
      </div>

      {loading && (
        <>
          <LoadingLabel />
          <SkeletonCards count={6} />
          <SkeletonRows />
        </>
      )}

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
            <div className="dashboard-panel dashboard-panel--highlight">
              <h2 className="dashboard-panel__title">
                {finance ? 'Editar salário' : `Você ainda não cadastrou o salário de ${monthLabel}.`}
              </h2>
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
              <DashboardCard label="Salário" icon="wallet" value={formatBRL(finance.salary)}>
                {!editingSalary && (
                  <button
                    type="button"
                    className="link-button"
                    aria-label={salary === 0 ? undefined : 'Editar salário'}
                    onClick={() => setEditingSalary(true)}
                  >
                    {salary === 0 ? 'Informar salário' : 'Editar'}
                  </button>
                )}
              </DashboardCard>
              <DashboardCard label="Gastos" icon="cart" value={formatBRL(totalSpent)} />
              <DashboardCard
                label="Saldo"
                icon="scale"
                value={formatBRL(balance)}
                tone={balance < 0 ? 'negative' : 'positive'}
              />
              <DashboardCard label="Gastos fixos" icon="pin" value={formatBRL(fixedTotal)} />
              <DashboardCard label="Gastos variáveis" icon="shuffle" value={formatBRL(variableTotal)} />
              {spentPercent !== null && (
                <DashboardCard
                  label="% do salário gasto"
                  icon="percent"
                  value={`${spentPercent}%`}
                  tone={spentPercent > 100 ? 'negative' : undefined}
                  progress={spentPercent}
                />
              )}
            </div>
          )}

          {overBudgetCategories.length > 0 && (
            <p className="status status--warning status--with-icon">
              <Icon name="alert" />
              <span>
                Caixinha estourada: {overBudgetCategories.map((budget) => budget.category.name).join(', ')}.
              </span>
            </p>
          )}

          <div className="section-header">
            <h2>Gastos do mês</h2>
            {hasCategories && !addingExpense && (
              <button type="button" className="button" onClick={() => setAddingExpense(true)}>
                <Icon name="plus" size={16} /> Adicionar gasto
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

          <div className="dashboard-grid">
            <div>
              <div className="section-header">
                <h2>Gastos por categoria</h2>
              </div>
              <div className="chart-panel">
                <CategoryChart expenses={expensesState.expenses} />
              </div>
            </div>

            <div>
              <div className="section-header">
                <h2>Caixinhas do mês</h2>
                {hasCategories && categoriesWithoutBudget.length > 0 && !addingBudget && (
                  <button type="button" className="button button--ghost" onClick={() => setAddingBudget(true)}>
                    <Icon name="plus" size={16} /> Nova caixinha
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
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default Dashboard
