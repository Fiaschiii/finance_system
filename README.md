# Controle Financeiro Pessoal #

Sistema local de controle financeiro pessoal: cadastro de salário, gastos fixos e variáveis, orçamentos por categoria ("caixinhas") e histórico mensal.

**Stack:** React + Vite · Node.js/Express · Supabase (PostgreSQL + Auth)

## Arquitetura

```
controle-financeiro/
├── frontend/   React + Vite        → http://localhost:5173
├── backend/    Node.js + Express   → http://localhost:3000
└── database/   Scripts SQL (Supabase)
```

## Pré-requisitos

- Node.js 18 ou superior e npm 9 ou superior (`node -v`, `npm -v`)
- Conta gratuita no [Supabase](https://supabase.com) — criaremos o projeto na Etapa 2

## Instalação

```bash
# Backend
cd backend
npm install

# Frontend (em outro terminal)
cd frontend
npm install
```

## Como iniciar o backend

```bash
cd backend
npm run dev
```

Abra http://localhost:3000/api/health — deve retornar um JSON com `"status": "ok"`.

## Como iniciar o frontend

```bash
cd frontend
npm run dev
```

Abra http://localhost:5173, crie sua conta e entre. O menu leva às páginas **Resumo**, **Histórico** e **Configurações**.

## Variáveis de ambiente

Copie `backend/.env.example` para `backend/.env` e `frontend/.env.example` para `frontend/.env`. Os valores do Supabase serão preenchidos na Etapa 2.

## Usando o sistema

- **Resumo**: o mês atual, com salário, gastos, saldo e % do salário gasto. As setas ‹ › trocam o mês, e o mês escolhido fica no endereço (`/?mes=2026-10`): dá para recarregar a página ou salvar nos favoritos sem perder o mês. Os gastos ficam logo abaixo dos cartões; o gráfico por categoria e as caixinhas, lado a lado.
- **Histórico**: gráfico de salário × gastos e a lista de todos os meses. Clique no mês para ver e editar os gastos ali mesmo, ou em "Ver resumo" para abri-lo no Resumo.
- **Configurações**: categorias, **aparência** (automático, claro ou escuro; o automático segue o sistema operacional) e o teste de **conexão** com o servidor e o banco.
- Cada ação (salvar, editar, excluir) mostra um aviso rápido no canto da tela.
- Funciona no celular: o menu vira um botão ☰ e as tabelas viram listas, sem rolagem para o lado.

## Testes

Os testes rodam sem internet e **sem tocar no Supabase**: o login e o banco são simulados, então podem ser rodados quantas vezes quiser, sem criar nem apagar dados reais.

```bash
cd backend && npm test     # 185 testes
cd frontend && npm test    # 99 testes
```

Use `npm run test:watch` para rodar de novo a cada arquivo salvo.

**Backend** (Vitest + Supertest), em `backend/tests/`:

- `unit/validators.test.js` e `unit/date.test.js`: cada regra de validação (mês, ano, dinheiro, UUID, textos, tipo, datas inexistentes como 31/02) e o cálculo do último dia do mês.
- `unit/services.test.js`: **toda consulta filtra por `user_id`** e todo insert grava o dono do login, nunca o enviado; tradução dos erros do Postgres (nome repetido, categoria com gastos); somas por mês e por categoria; criação do mês sem duplicar quando chegam duas requisições juntas.
- `api/auth-and-security.test.js`: todas as rotas exigem login (sem token, token inválido, Supabase fora do ar); o backend usa a chave publishable com o token do usuário; `helmet`, CORS, JSON malformado, corpo acima de 10 kB e erro 500 sem detalhe em produção.
- `api/rate-limit.test.js`: a requisição seguinte ao limite recebe 429.
- `api/finance.test.js`, `api/expenses.test.js`, `api/categories-and-budgets.test.js`: cada rota, com os casos de sucesso, de validação (400), de "não encontrado / de outra pessoa" (404), de categoria de outro usuário e de campos enviados pelo cliente que devem ser ignorados (`user_id`, `monthly_finance_id`).

**Frontend** (Vitest + Testing Library + jsdom), em `frontend/tests/`:

- `utils/`: leitura de valores digitados no formato brasileiro (`1.200,50`, `R$ 1.200`), formatação de moeda, somas em centavos, datas sem erro de fuso e tradução das mensagens do Supabase.
- `services/api.test.js`: envio do token, mensagens de erro, resposta sem corpo e backend desligado.
- `components/`: formulários de salário e de gasto (validação, valores enviados, edição), rotas protegidas (sem login vai para o login), tela de cadastro (senha mínima de 8 caracteres), cabeçalho com menu de celular, seletor de mês, avisos rápidos e a troca de mês no Resumo (inclusive quando uma resposta antiga chega atrasada).
- `utils/month-and-theme.test.js`: cálculo do mês anterior/seguinte, mês na URL e escolha de tema.
O que **não** é coberto aqui é o RLS do banco: ele foi testado à parte num PostgreSQL local (ver [`database/README.md`](database/README.md#testado-antes-da-entrega)) e pode ser conferido no Supabase com `database/checks/verificar_seguranca.sql`.

## Segurança

O que protege os dados:

- **RLS no banco**: cada usuário só lê e grava as próprias linhas, mesmo acessando a API do Supabase diretamente. Detalhes e testes em [`database/README.md`](database/README.md#segurança-etapa-12).
- **O backend nunca usa a chave secret.** Toda consulta é feita com o login do próprio usuário (o token que o frontend envia), então o RLS vale sempre.
- **Backend**: cabeçalhos de segurança (`helmet`), CORS liberado só para o `FRONTEND_URL`, limite de 300 requisições a cada 15 minutos por IP, corpo JSON de no máximo 10 kB e validação de todos os campos. Com `NODE_ENV=production`, os erros 500 não mostram detalhes técnicos.

### Ajustes no painel do Supabase (manual, uma vez)

1. **SQL Editor**: rode `database/migrations/0003_security_hardening.sql` e depois `database/checks/verificar_seguranca.sql`. Tudo deve aparecer com ✅.
2. **Authentication → Sign In / Providers → Email**: deixe **Confirm email** ligado e mude **Minimum password length** para **8**, o mesmo mínimo das telas de cadastro e de nova senha.
3. **Authentication → URL Configuration**: em **Site URL**, coloque `http://localhost:5173`. Em **Redirect URLs**, coloque `http://localhost:5173/reset-password`. Assim, o link de "esqueci minha senha" só leva de volta para o seu sistema.
4. **Advisors → Security Advisor**: não deve sobrar nenhum item em vermelho (*Error*) nas tabelas do projeto.
5. Nunca coloque a chave **secret** (antiga `service_role`) em nenhum `.env` deste projeto. Ela ignora o RLS e o sistema não precisa dela.

## Progresso das etapas

- [x] Etapa 1 — Estrutura do projeto
- [x] Etapa 2 — Configurar Supabase
- [x] Etapa 3 — Banco de dados e tabelas
- [x] Etapa 4 — Autenticação
- [x] Etapa 5 — Cadastro de salário
- [x] Etapa 6 — Cadastro de gastos
- [x] Etapa 7 — Categorias
- [x] Etapa 8 — Caixinhas / orçamentos
- [x] Etapa 9 — Dashboard
- [x] Etapa 10 — Histórico mensal
- [x] Etapa 11 — Gráficos
- [x] Etapa 12 — Segurança e RLS
- [x] Etapa 13 — Testes
- [x] Etapa 14 — UI/UX

As seções sobre configuração do Supabase, criação das tabelas, RLS e criação de usuário serão adicionadas aqui conforme cada etapa for concluída.
