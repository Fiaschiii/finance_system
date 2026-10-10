// Cartão de resumo reutilizável (Salário agora; Gastos, Saldo etc. na Etapa 9).
function DashboardCard({ label, value, children }) {
  return (
    <div className="dashboard-card">
      <span className="dashboard-card__label">{label}</span>
      <strong className="dashboard-card__value">{value}</strong>
      {children}
    </div>
  )
}

export default DashboardCard
