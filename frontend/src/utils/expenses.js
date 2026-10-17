// Tipos de gasto: o `value` é o que o backend e o banco guardam.
export const EXPENSE_TYPES = [
  { value: 'fixo', label: 'Fixo' },
  { value: 'variavel', label: 'Variável' },
]

export function typeLabel(type) {
  return EXPENSE_TYPES.find((item) => item.value === type)?.label ?? type
}
