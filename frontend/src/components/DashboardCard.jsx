// Cartão de resumo reutilizável. `tone="negative"` destaca valores negativos.
function DashboardCard({ label, value, tone, children }) {
  return (
    <div className={`dashboard-card${tone ? ` dashboard-card--${tone}` : ''}`}>
      <span className="dashboard-card__label">{label}</span>
      <strong className="dashboard-card__value">{value}</strong>
      {children}
    </div>
  )
}

export default DashboardCard
