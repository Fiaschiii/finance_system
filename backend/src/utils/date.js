export function currentMonthYear(date = new Date()) {
  return { month: date.getMonth() + 1, year: date.getFullYear() }
}
