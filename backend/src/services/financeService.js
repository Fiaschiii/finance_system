// Acesso ao banco para a tabela monthly_finances (salário de cada mês).
// Todas as funções recebem o cliente Supabase da requisição (req.supabase),
// que já está autenticado como o usuário — o RLS do banco garante que cada
// um só enxerga e altera as próprias linhas. O filtro explícito por user_id
// é uma segunda camada de proteção.

export async function getFinanceByMonth(supabase, userId, month, year) {
  const { data, error } = await supabase
    .from('monthly_finances')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle()

  if (error) throw error
  return data // null se o mês ainda não tem registro
}

export async function createFinance(supabase, userId, { month, year, salary }) {
  const { data, error } = await supabase
    .from('monthly_finances')
    .insert({ user_id: userId, month, year, salary })
    .select()
    .single()

  if (error) throw error
  return data
}

// Só o salário pode mudar: mês e ano identificam o registro e não são editáveis.
export async function updateSalary(supabase, userId, id, salary) {
  const { data, error } = await supabase
    .from('monthly_finances')
    .update({ salary })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .maybeSingle()

  if (error) throw error
  return data // null se não existe (ou não é do usuário)
}
