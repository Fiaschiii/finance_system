-- ============================================================
-- Verificação de segurança (só LÊ, não altera nada)
-- Rode no Supabase: SQL Editor > New query > cole tudo > Run
-- Pode rodar quantas vezes quiser. Tudo deve aparecer com ✅.
-- ============================================================

with tabelas as (
  select unnest(array['categories', 'monthly_finances', 'expenses', 'budgets']) as tabela
),
rls as (
  select t.tabela, coalesce(c.relrowsecurity, false) as ativo
  from tabelas t
  left join pg_class c on c.relname = t.tabela and c.relnamespace = 'public'::regnamespace
),
politicas as (
  select tablename as tabela,
         count(*) filter (where permissive = 'PERMISSIVE') as total,
         count(*) filter (where permissive = 'RESTRICTIVE' and policyname = tablename || ': mfa') as mfa,
         bool_and(roles = '{authenticated}') as so_logados
  from pg_policies
  where schemaname = 'public'
  group by tablename
),
fks as (
  select conname
  from pg_constraint
  where connamespace = 'public'::regnamespace and contype = 'f'
),
checks as (
  select conname
  from pg_constraint
  where connamespace = 'public'::regnamespace and contype = 'c'
)
select item, case when ok then '✅' else '❌' end as status
from (
  select 'RLS ativo em ' || tabela as item, ativo as ok, 1 as ordem from rls
  union all
  select '4 políticas, só para usuários logados, em ' || t.tabela,
         coalesce(p.total = 4 and p.so_logados, false), 2
  from tabelas t left join politicas p using (tabela)
  union all
  select 'Verificação em duas etapas exigida pelo banco em ' || t.tabela,
         coalesce(p.mfa = 1, false), 6
  from tabelas t left join politicas p using (tabela)
  union all
  select 'Função do MFA fora da API e sem acesso de visitantes',
         coalesce((select p.prosecdef
                          and p.proconfig @> array['search_path=""']
                          and not has_function_privilege('anon', p.oid, 'execute')
                   from pg_proc p
                   where p.oid = to_regprocedure('private.mfa_satisfied()')), false), 6
  union all
  select 'Gasto só aponta para mês do mesmo dono',
         exists (select 1 from fks where conname = 'expenses_monthly_finance_same_owner_fkey'), 3
  union all
  select 'Gasto só aponta para categoria do mesmo dono',
         exists (select 1 from fks where conname = 'expenses_category_same_owner_fkey'), 3
  union all
  select 'Caixinha só aponta para categoria do mesmo dono',
         exists (select 1 from fks where conname = 'budgets_category_same_owner_fkey'), 3
  union all
  select 'Limites de texto no banco (categorias e gastos)',
         (select count(*) = 4 from checks where conname in (
           'categories_name_check', 'categories_description_check',
           'expenses_description_check', 'expenses_notes_check')), 4
  union all
  select 'Funções com search_path fixo',
         (select bool_and(proconfig @> array['search_path=""'])
          from pg_proc
          where pronamespace = 'public'::regnamespace
            and proname in ('handle_new_user', 'set_updated_at')), 5
  union all
  select 'handle_new_user não pode ser chamada pela API',
         not has_function_privilege('authenticated', 'public.handle_new_user()', 'execute')
         and not has_function_privilege('anon', 'public.handle_new_user()', 'execute'), 5
) resultado
order by ordem, item;
