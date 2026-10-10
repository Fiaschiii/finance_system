import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useFinance } from '../hooks/useFinance.js'
import { formatBRL } from '../utils/currency.js'
import { formatMonthYear } from '../utils/date.js'
import DashboardCard from '../components/DashboardCard.jsx'
import SalaryForm from '../components/SalaryForm.jsx'
import SupabaseStatus from '../components/SupabaseStatus.jsx'

function Dashboard() {
  const { user } = useAuth()
  const { month, year, finance, loading, error, saveSalary, reload } = useFinance()
  const [editing, setEditing] = useState(false)

  const ready = !loading && !error
  const monthLabel = month && year ? formatMonthYear(month, year) : ''
  const showForm = ready && (editing || !finance)

  async function handleSave(salary) {
    await saveSalary(salary)
    setEditing(false)
  }

  return (
    <section className="page">
      <h1>Olá, {user?.email}</h1>
      {monthLabel && <h2 className="page__subtitle">Resumo de {monthLabel}</h2>}

      {loading && <p className="status status--pending">Carregando…</p>}

      {error && (
        <div className="dashboard-panel">
          <p className="status status--error">{error}</p>
          <button type="button" className="button button--ghost" onClick={reload}>
            Tentar de novo
          </button>
        </div>
      )}

      {showForm && (
        <div className="dashboard-panel">
          <h3 className="dashboard-panel__title">
            {finance ? 'Editar salário' : 'Você ainda não cadastrou o salário deste mês.'}
          </h3>
          <SalaryForm
            monthLabel={monthLabel}
            initialValue={finance?.salary ?? null}
            onSave={handleSave}
            onCancel={finance ? () => setEditing(false) : undefined}
          />
        </div>
      )}

      {ready && finance && !editing && (
        <DashboardCard label="Salário" value={formatBRL(finance.salary)}>
          <button type="button" className="link-button" onClick={() => setEditing(true)}>
            Editar
          </button>
        </DashboardCard>
      )}

      {ready && <p>Gastos, saldo e caixinhas chegam nas próximas etapas.</p>}

      <SupabaseStatus />
    </section>
  )
}

export default Dashboard
