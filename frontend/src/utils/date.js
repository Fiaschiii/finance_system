export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// (10, 2026) -> "Outubro/2026"
export function formatMonthYear(month, year) {
  return `${MONTH_NAMES[month - 1]}/${year}`
}

const pad = (n) => String(n).padStart(2, '0')

// Data de hoje (horário local) como "AAAA-MM-DD". Não usa toISOString porque ele
// converte para UTC: depois das 21h no horário de Brasília viraria "amanhã".
export function toISODate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Primeiro e último dia de um mês, como "AAAA-MM-DD".
export function monthRange(month, year) {
  const lastDay = new Date(year, month, 0).getDate()
  return { min: `${year}-${pad(month)}-01`, max: `${year}-${pad(month)}-${pad(lastDay)}` }
}

// "2026-10-05" -> "05/10". Mexe na string de propósito: new Date("2026-10-05")
// é interpretado como UTC e, no Brasil, mostraria o dia anterior.
export function formatDayMonth(iso) {
  const [, month, day] = iso.split('-')
  return `${day}/${month}`
}

// (10, 2026) -> "Out/26" (rótulo curto, para eixos de gráfico)
export function formatShortMonthYear(month, year) {
  return `${MONTH_NAMES[month - 1].slice(0, 3)}/${String(year).slice(-2)}`
}
