import Icon from './Icon.jsx'
import { formatMonthYear, shiftMonth } from '../utils/date.js'

const MIN = 2000 * 12
const MAX = 2100 * 12 + 11

// ‹ Outubro/2026 ›  — troca o mês exibido. "Ir para o mês atual" aparece
// quando a pessoa está olhando outro mês.
function MonthPicker({ month, year, current, onChange }) {
  const index = year * 12 + (month - 1)
  const isCurrent = month === current.month && year === current.year
  const prev = shiftMonth(month, year, -1)
  const next = shiftMonth(month, year, 1)

  return (
    <div className="month-picker">
      <button
        type="button"
        className="icon-button"
        onClick={() => onChange(prev)}
        disabled={index <= MIN}
        aria-label={`Mês anterior (${formatMonthYear(prev.month, prev.year)})`}
      >
        <Icon name="chevronLeft" />
      </button>
      <span className="month-picker__label" aria-live="polite">
        {formatMonthYear(month, year)}
      </span>
      <button
        type="button"
        className="icon-button"
        onClick={() => onChange(next)}
        disabled={index >= MAX}
        aria-label={`Próximo mês (${formatMonthYear(next.month, next.year)})`}
      >
        <Icon name="chevronRight" />
      </button>
      {!isCurrent && (
        <button type="button" className="link-button month-picker__today" onClick={() => onChange(current)}>
          Ir para o mês atual
        </button>
      )}
    </div>
  )
}

export default MonthPicker
