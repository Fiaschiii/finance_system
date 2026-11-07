// Cliente falso do Supabase para testar os serviços sem banco.
//
// Cada chamada a .from() consome o próximo resultado da fila `results` e
// registra os métodos encadeados (select, eq, insert...) em `queries`, para o
// teste conferir o que o serviço pediu ao banco.
const CHAIN_METHODS = ['select', 'insert', 'update', 'delete', 'eq', 'gte', 'lte', 'order', 'limit']

export function fakeSupabase(...results) {
  const queue = [...results]
  const queries = []

  const client = {
    from(table) {
      const query = { table, calls: [] }
      queries.push(query)
      const result = Promise.resolve(queue.shift() ?? { data: null, error: null })

      const builder = {
        then: (onOk, onFail) => result.then(onOk, onFail),
      }
      for (const method of CHAIN_METHODS) {
        builder[method] = (...args) => {
          query.calls.push([method, ...args])
          return builder
        }
      }
      for (const method of ['single', 'maybeSingle']) {
        builder[method] = () => {
          query.calls.push([method])
          return result
        }
      }
      return builder
    },
  }

  return { client, queries }
}

// Atalho: só os filtros .eq(coluna, valor) de uma consulta, como objeto.
export function eqFilters(query) {
  return Object.fromEntries(query.calls.filter(([m]) => m === 'eq').map(([, col, val]) => [col, val]))
}
