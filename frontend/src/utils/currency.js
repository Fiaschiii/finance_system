const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

// 1200 -> "R$ 1.200,00"
export function formatBRL(value) {
  const number = Number(value)
  return brl.format(Number.isFinite(number) ? number : 0)
}

// 1200.5 -> "1200,50" (valor para preencher um campo de texto, sem milhar)
export function formatInputBRL(value) {
  const number = Number(value)
  return (Number.isFinite(number) ? number : 0).toFixed(2).replace('.', ',')
}

// Lê o que a pessoa digitou no formato brasileiro e devolve um número (ou NaN):
// "1200", "1200,50", "1.200,50", "R$ 1.200,50" e também "1200.50".
export function parseBRL(text) {
  if (typeof text !== 'string') return NaN

  let s = text.replace(/R\$/gi, '').replace(/\s/g, '')
  if (!/\d/.test(s) || !/^[\d.,]+$/.test(s)) return NaN

  if (s.includes(',')) {
    // vírgula = separador decimal; pontos são separadores de milhar
    const parts = s.split(',')
    if (parts.length > 2) return NaN
    s = `${parts[0].replace(/\./g, '')}.${parts[1]}`
  } else if (/^[1-9]\d{0,2}(\.\d{3})+$/.test(s)) {
    // "1.200" ou "1.200.000": pontos de milhar
    s = s.replace(/\./g, '')
  }
  // senão, um ponto único é decimal ("1200.50")

  const number = Number(s)
  return Number.isFinite(number) ? number : NaN
}
