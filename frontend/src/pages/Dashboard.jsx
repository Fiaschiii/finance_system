import SupabaseStatus from '../components/SupabaseStatus.jsx'

function Dashboard() {
  return (
    <section className="page">
      <h1>Dashboard</h1>
      <p>
        Aqui vai ficar o resumo do mês atual: salário, total de gastos, saldo
        disponível, gastos por categoria e as caixinhas. Chega a partir da Etapa 5.
      </p>
      <SupabaseStatus />
    </section>
  )
}

export default Dashboard
