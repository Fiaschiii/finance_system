import { useFinanceHistory } from '../hooks/useFinanceHistory.js'
import { useCategories } from '../hooks/useCategories.js'
import HistoryRow from '../components/HistoryRow.jsx'
import MonthlyChart from '../components/MonthlyChart.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { Skeleton, SkeletonRows, LoadingLabel } from '../components/Skeleton.jsx'

function History() {
  usePageTitle('Histórico')
  const { history, loading, error, updateSalary, reload } = useFinanceHistory()
  const categoriesState = useCategories()

  const combinedError = error || categoriesState.error
  const combinedLoading = !combinedError && (loading || categoriesState.loading)

  function reloadAll() {
    reload()
    categoriesState.reload()
  }

  return (
    <section className="page page--wide">
      <h1>Histórico mensal</h1>

      {combinedLoading && (
        <>
          <LoadingLabel />
          <div className="chart-panel">
            <Skeleton height={220} />
          </div>
          <SkeletonRows />
        </>
      )}

      {combinedError && (
        <div className="dashboard-panel">
          <p className="status status--error">{combinedError}</p>
          <button type="button" className="button button--ghost" onClick={reloadAll}>
            Tentar de novo
          </button>
        </div>
      )}

      {!combinedLoading && !combinedError && history.length === 0 && (
        <p className="empty-state">Nenhum mês cadastrado ainda.</p>
      )}

      {!combinedLoading && !combinedError && history.length > 0 && (
        <div className="section-header">
          <h2>Salário × Gastos{history.length > 1 ? ` (últimos ${Math.min(history.length, 12)} meses)` : ''}</h2>
        </div>
      )}

      {!combinedLoading && !combinedError && history.length > 0 && (
        <div className="chart-panel">
          <MonthlyChart history={history} />
        </div>
      )}

      {!combinedLoading && !combinedError && history.length > 0 && (
        <div className="table-wrap">
          <table className="expense-table history-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th className="num">Salário</th>
                <th className="num">Gastos</th>
                <th className="num">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  categories={categoriesState.categories}
                  onSaveSalary={updateSalary}
                  onChanged={reload}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default History
