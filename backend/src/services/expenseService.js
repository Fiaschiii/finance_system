// Acesso ao banco para a tabela expenses. Como nos outros serviços, recebe o
// cliente da requisição (já autenticado como o usuário), então o RLS vale.

// Traz a categoria junto, pra a tela não precisar cruzar os dados.
const SELECT = '*, category:categories(id, name)'

export async function listExpenses(supabase, userId, monthlyFinanceId) {
  const { data, error } = await supabase
    .from('expenses')
    .select(SELECT)
    .eq('user_id', userId)
    .eq('monthly_finance_id', monthlyFinanceId)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getExpenseById(supabase, userId, id) {
  const { data, error } = await supabase
    .from('expenses')
    .select(SELECT)
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createExpense(supabase, userId, values) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...values, user_id: userId })
    .select(SELECT)
    .single()

  if (error) throw error
  return data
}

export async function updateExpense(supabase, userId, id, values) {
  const { data, error } = await supabase
    .from('expenses')
    .update(values)
    .eq('id', id)
    .eq('user_id', userId)
    .select(SELECT)
    .maybeSingle()

  if (error) throw error
  return data // null se não existe (ou não é do usuário)
}

export async function deleteExpense(supabase, userId, id) {
  const { data, error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle()

  if (error) throw error
  return data // null se não existia (ou não é do usuário)
}
