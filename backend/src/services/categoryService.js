// Acesso ao banco para a tabela categories. Somente leitura por enquanto:
// criar, editar e excluir categorias chega na Etapa 7.

export async function listCategories(supabase, userId) {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, description')
    .eq('user_id', userId)

  if (error) throw error

  // Ordena em JS (pt-BR) pra "Saúde" e "Alimentação" não irem parar no fim
  // por causa da collation do banco.
  return data.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

// Confirma que a categoria existe E é do usuário (o RLS esconde as dos outros).
export async function getCategoryById(supabase, userId, id) {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data // null se não existe ou não é do usuário
}
