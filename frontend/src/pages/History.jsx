import { useFinanceHistory } from '../hooks/useFinanceHistory.js'
import { useCategories } from '../hooks/useCategories.js'
import HistoryRow from '../components/HistoryRow.jsx'

function History() {
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

      {combinedLoading && <p className="status status--pending">Carregando…</p>}

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
        <div className="table-wrap">
          <table className="expense-table">
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
