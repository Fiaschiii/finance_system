export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// (10, 2026) -> "Outubro/2026"
export function formatMonthYear(month, year) {
  return `${MONTH_NAMES[month - 1]}/${year}`
}
