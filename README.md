# Controle Financeiro Pessoal

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

## Progresso das etapas

- [x] Etapa 1 — Estrutura do projeto
- [x] Etapa 2 — Configurar Supabase
- [ ] Etapa 3 — Banco de dados e tabelas
- [ ] Etapa 4 — Autenticação
- [ ] Etapa 5 — Cadastro de salário
- [ ] Etapa 6 — Cadastro de gastos
- [ ] Etapa 7 — Categorias
- [ ] Etapa 8 — Caixinhas / orçamentos
- [ ] Etapa 9 — Dashboard
- [ ] Etapa 10 — Histórico mensal
- [ ] Etapa 11 — Gráficos
- [ ] Etapa 12 — Segurança e RLS
- [ ] Etapa 13 — Testes
- [ ] Etapa 14 — UI/UX

As seções sobre configuração do Supabase, criação das tabelas, RLS e criação de usuário serão adicionadas aqui conforme cada etapa for concluída.
