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

Abra http://localhost:5173 — o menu (Dashboard / Histórico / Configurações / Login) já navega entre as páginas (ainda como placeholders).

## Variáveis de ambiente

Copie `backend/.env.example` para `backend/.env` e `frontend/.env.example` para `frontend/.env`. Os valores do Supabase serão preenchidos na Etapa 2.

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
- [ ] Etapa 13 — Testes
- [ ] Etapa 14 — UI/UX

As seções sobre configuração do Supabase, criação das tabelas, RLS e criação de usuário serão adicionadas aqui conforme cada etapa for concluída.
