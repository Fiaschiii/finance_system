const MIN_YEAR = 2000
const MAX_YEAR = 2100
const MAX_MONEY = 9999999999.99 // limite de numeric(12,2) no banco

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Erro de validação de entrada: o errorHandler transforma em HTTP 400.
export class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Aceita número inteiro ou string só com dígitos ("9"); rejeita true, null, "", [] etc.
function toInteger(value) {
  if (typeof value === 'number') return Number.isInteger(value) ? value : NaN
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value)
  return NaN
}

export function parseMonth(value) {
  const month = toInteger(value)
  if (Number.isNaN(month) || month < 1 || month > 12) {
    throw new ValidationError('Mês inválido: use um número de 1 a 12.')
  }
  return month
}

export function parseYear(value) {
  const year = toInteger(value)
  if (Number.isNaN(year) || year < MIN_YEAR || year > MAX_YEAR) {
    throw new ValidationError(`Ano inválido: use um valor entre ${MIN_YEAR} e ${MAX_YEAR}.`)
  }
  return year
}

// Valor em reais como número (1200.5) ou string com ponto decimal ("1200.50").
// Arredonda para 2 casas, igual ao numeric(12,2) do banco.
export function parseMoney(value, label = 'Valor') {
  let number = NaN
  if (typeof value === 'number') {
    number = value
  } else if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value.trim())) {
    number = Number(value)
  }

  if (!Number.isFinite(number) || number < 0) {
    throw new ValidationError(`${label} inválido: informe um número maior ou igual a zero.`)
  }
  if (number > MAX_MONEY) {
    throw new ValidationError(`${label} alto demais.`)
  }
  return Math.round(number * 100) / 100
}

export function parseUuid(value) {
  if (typeof value !== 'string' || !UUID_REGEX.test(value)) {
    throw new ValidationError('Identificador inválido.')
  }
  return value
}
