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

Abra http://localhost:5173, crie sua conta e entre. O menu leva às páginas **Resumo**, **Histórico** e **Configurações**; clicar no seu nome (ou foto), no canto, abre **Minha conta**.

## Variáveis de ambiente

Copie `backend/.env.example` para `backend/.env` e `frontend/.env.example` para `frontend/.env`. Os valores do Supabase serão preenchidos na Etapa 2.

## Usando o sistema

- **Resumo**: o mês atual, com salário, gastos, saldo e % do salário gasto. As setas ‹ › trocam o mês, e o mês escolhido fica no endereço (`/?mes=2026-10`): dá para recarregar a página ou salvar nos favoritos sem perder o mês. Os gastos ficam logo abaixo dos cartões; o gráfico por categoria e as caixinhas, lado a lado.
- **Histórico**: gráfico de salário × gastos e a lista de todos os meses. Clique no mês para ver e editar os gastos ali mesmo, ou em "Ver resumo" para abri-lo no Resumo.
- **Configurações**: categorias e o teste de **conexão** com o servidor e o banco.
- **Minha conta**: dados cadastrais (foto, nome, telefone, e-mail), segurança (senha, verificação em duas etapas, sessões ativas) e preferências (idioma, tema e avisos). Ver [Etapa 18](#minha-conta-etapa-18).
- Cada ação (salvar, editar, excluir) mostra um aviso rápido no canto da tela.
- Ao trocar de página, uma tela de carregamento com o ícone do sistema cobre o conteúdo até os dados chegarem (no mínimo ~0,5 s, para não piscar). Trocar só o mês no Resumo não a mostra.
- Botões e links reagem ao mouse: levantam, ganham sombra ou um fundo suave, e "afundam" no clique.
- Funciona no celular: o menu vira um botão ☰ e as tabelas viram listas, sem rolagem para o lado.

## Verificação em duas etapas (MFA)

Opcional, por conta. Depois de ativada, o login pede a senha **e** um código de 6 dígitos que muda a cada 30 segundos no app autenticador do celular (Microsoft Authenticator, Google Authenticator, Authy etc.).

**Ativar:** Minha conta → Segurança → Verificação em duas etapas → **Ativar**. No Microsoft Authenticator, toque em **+** → **Outra conta (Google, Facebook etc.)**, leia o QR Code e digite o código que aparecer. A conta aparece no app como "Controle Financeiro".

**Entrar:** e-mail e senha, depois a tela pede o código. Enquanto ele não for digitado, nenhuma página do sistema abre e o cabeçalho mostra só "Sair".

**Desativar:** na mesma seção, **Desativar** (pede confirmação). Só funciona numa sessão que já passou pelo código.

Por dentro: o Supabase marca a sessão como `aal1` (só senha) ou `aal2` (senha + código). Quem tem app confirmado precisa de `aal2` em três lugares:

- no **frontend**, que manda para `/mfa` em vez de abrir as páginas;
- no **backend**, que responde 403 (`code: "mfa_required"`) a qualquer rota;
- no **banco**, com uma política restritiva em cada tabela (migração `0004`). Assim, nem falando direto com a API do Supabase dá para pular o código.

**Perdeu o celular?** O Supabase não tem códigos de recuperação. Para remover o app de uma conta, vá ao painel: **Authentication → Users**, abra o usuário e apague o fator MFA. Depois disso, a conta volta a entrar só com a senha e pode cadastrar um novo app.


## Segurança avançada (Etapa 16)

- **CAPTCHA (Cloudflare Turnstile)** no login, no cadastro e no "esqueci minha senha". Quase sempre ele se resolve sozinho, sem clique: o navegador prova que não é um robô e o Supabase confere esse comprovante antes de aceitar a senha. Isso segura robôs que testam milhares de senhas. Fica desligado até você configurar (ver abaixo).
- **Content-Security-Policy**: o build de produção (`npm run build`) traz uma lista do que a página pode carregar. Scripts só vêm do próprio site, do script de tema (pelo hash exato) e do Turnstile; conexões só vão para o Supabase e o backend; nada de iframes (exceto o do CAPTCHA), plugins ou formulários enviados para fora. Se alguém conseguir injetar um `<script>` (XSS), o navegador não o roda. A política é montada em [`frontend/csp.js`](frontend/csp.js). No `npm run dev` ela não é aplicada, porque o Vite precisa de scripts inline para recarregar a página.
- **Sessão encerrada por inatividade**: depois de 15 minutos sem uso (`VITE_IDLE_TIMEOUT_MINUTES`), aparece "Você ainda está aí?" com uma contagem de 60 s. Sem resposta, o sistema sai deste navegador e a tela de login explica o motivo. Usar o sistema em outra aba conta como uso. Durante o aviso, só mexer o mouse não basta, é preciso clicar em "Continuar conectado". O logout por inatividade não derruba a sessão do celular.
- **Avisos por e-mail** quando a senha, o e-mail ou o app autenticador mudam. São textos em português para colar no Supabase: veja [`docs/emails/`](docs/emails/README.md).
- Campos de e-mail e senha com `autocomplete`, para o gerenciador de senhas preencher e sugerir senhas fortes no cadastro.

### Configurar no painel (Etapa 16)

1. **CAPTCHA:**
   1. No [Cloudflare](https://dash.cloudflare.com/) (conta gratuita), vá em **Turnstile → Add widget** e coloque o domínio do sistema (e `localhost`, para desenvolver). Modo **Managed**.
   2. Copie a **Site Key** para `VITE_TURNSTILE_SITE_KEY` no `frontend/.env`.
   3. No Supabase, vá em **Authentication → Attack Protection → Enable Captcha protection**, escolha **Turnstile** e cole a **Secret Key**.
   4. Ligue os dois juntos: só no Supabase, o login falha ("verificação anti-robô falhou"); só no `.env`, o widget aparece mas não protege nada.
   5. Para testar sem conta no Cloudflare, use a site key `1x00000000000000000000AA` com a secret `1x0000000000000000000000000000000AA`. Ela sempre aprova e mostra a faixa "Somente para teste".
2. **E-mails de segurança:** siga [`docs/emails/README.md`](docs/emails/README.md).
3. **Authentication → Sign In / Providers → Email:** ligue **Secure password change**. Assim, trocar a senha exige ter entrado há pouco tempo.
4. **Em produção, se a hospedagem permitir cabeçalhos:** mande a mesma política como cabeçalho `Content-Security-Policy` e acrescente `frame-ancestors 'none'` (impede o site de ser aberto dentro de um iframe alheio). Essa diretiva não funciona pela `<meta>`.

## Resistência a excesso de requisições (Etapa 17)

O backend aguenta quem tenta martelar a API (um robô, um script com defeito, alguém clicando sem parar) sem cair e sem gastar consultas ao Supabase à toa. Quem passa de um limite recebe **429** com a mensagem e quantos segundos esperar (no corpo, `retryAfter`, e no cabeçalho `Retry-After`).

| Limite | Contado por | Padrão | Variável no `backend/.env` |
|---|---|---|---|
| Rajada | IP | 60 por minuto | `RATE_LIMIT_BURST` |
| Volume | IP | 300 a cada 15 min | `RATE_LIMIT_MAX` |
| Login inválido (respostas 401) | IP | 30 a cada 15 min | `RATE_LIMIT_AUTH_FAILURES` |
| Gravações (criar, editar, excluir) | usuário | 30 por minuto | `RATE_LIMIT_WRITES` |
| Teste de conexão com o banco (`/api/health/supabase`) | IP | 10 por minuto | `RATE_LIMIT_HEALTH_DB` |

- Os limites por IP rodam **antes** de ler o corpo e de validar o token: quem foi barrado não custa nenhuma consulta ao Supabase. O de gravações conta por usuário, então trocar de IP não ajuda.
- **Conexões lentas** (ataque *slowloris*): cabeçalhos em até 10 s e a requisição inteira em até 30 s; depois disso, a conexão é fechada (408). Conexões paradas fecham em 5 s.
- **Supabase lento**: cada chamada ao Supabase tem 10 s de prazo. Passou disso, vira erro em vez de deixar requisições se acumulando no backend.
- **Atrás de um proxy** (Nginx, Render, Railway...), preencha `TRUST_PROXY=1`, senão todos os usuários dividem o limite do IP do proxy. Sem proxy, deixe vazio: assim ninguém escapa do limite inventando um `X-Forwarded-For`.
- **No frontend**, o aviso de erro diz quando tentar de novo ("… (liberado em 42 s)"), e leituras iguais feitas ao mesmo tempo viram uma só requisição.
- Os contadores ficam na memória do backend: reiniciá-lo zera todos. Para mais de uma instância do backend, eles teriam de ir para um armazenamento compartilhado (Redis, por exemplo).

## Minha conta (Etapa 18)

Autogestão do perfil (*self-service profile management*): cada pessoa cuida da própria conta sem depender de ninguém. Fica em **Minha conta** (clique no seu nome ou foto, no cabeçalho), em três abas. A aba aberta fica no endereço (`/profile?aba=seguranca`).

**Dados cadastrais**

- **Foto**: JPEG, PNG ou WebP. O navegador recorta em quadrado e reduz para 256×256 antes de enviar, o que também descarta os metadados da foto (como a localização GPS). O backend confere o tipo pelos primeiros bytes do arquivo, não pelo nome. A foto fica num bucket **privado** do Supabase Storage e só abre por um link temporário (1 hora) gerado para o próprio dono. Sem foto, aparecem as iniciais.
- **Nome** e **telefone**: o telefone pode ser digitado como quiser (`(11) 98765-4321`, `11987654321`, `+55 11 …`); é guardado no formato internacional (`+5511987654321`).
- **E-mail**: a troca passa pelo Supabase, que manda um link de confirmação (e, com *Secure email change* ligado, avisa também o e-mail antigo). O e-mail só muda depois do clique; até lá, a tela mostra "troca pendente".

**Segurança**

- **Senha**: nova senha + confirmação (mínimo de 8 caracteres). Com *Secure password change* ligado no Supabase e um login antigo, o Supabase manda um código para o e-mail e a troca só passa com ele.
- **Verificação em duas etapas**: a mesma da Etapa 15, que saiu de Configurações e veio para cá.
- **Sessões ativas**: cada aparelho/navegador conectado, com o último uso, o IP e se entrou com o código do app. "Este aparelho" fica marcado. Dá para encerrar uma sessão ou **todas as outras** de uma vez. Uma sessão encerrada cai **na hora**: o backend recusa o token dela e o banco também (ver abaixo).

**Preferências** (salvas na hora, sem botão "Salvar"; ficam no perfil e acompanham a pessoa em qualquer navegador)

- **Idioma**: português ou inglês. Traduz **o sistema inteiro**: telas, mensagens, avisos, moeda (`R$ 1.200,50` × `R$1,200.50`, sempre em reais), datas e meses, os erros do Supabase e os erros que vêm do backend. Antes de entrar, o idioma troca pelo botão **EN/PT** do cabeçalho; na primeira visita, segue o idioma do navegador.
- **Tema**: automático, claro ou escuro (antes ficava em Configurações).
- **Avisos no Resumo**: caixinha perto do limite (80%) ou estourada; salário do mês ainda não informado; lembrete para ativar a verificação em duas etapas. Cada um pode ser desligado.

### Regra de segurança: o dono é sempre quem está logado

O backend nunca confia num id de usuário que venha da requisição. O "Usuário A" não consegue ver nem alterar nada do "Usuário B" mexendo na URL ou no corpo da requisição, e isso vale em quatro camadas:

1. **Não há endereço para o perfil de outra pessoa.** As rotas são `/api/profile`, `/api/profile/avatar` e `/api/profile/sessions`, sem id de usuário. `/api/profile/<id-de-alguém>` responde 404.
2. **O id vem do token.** O `requireAuth` valida o token com o Supabase e guarda `req.user.id`; os serviços filtram e gravam sempre com ele. O controller só aceita uma lista fechada de campos (nome, telefone, idioma, tema, avisos): o resto é ignorado.
3. **Id de outra pessoa na requisição é recusado.** Se o corpo ou a query trouxerem `id`, `user_id`, `userId`, `owner` ou `owner_id` diferente do logado, a resposta é **403** (`code: "forbidden_user"`), nada é gravado e a tentativa fica no log do servidor (`[segurança] usuário … tentou usar user_id=…`).
4. **O banco confere de novo (RLS).** A tabela `profiles` tem o próprio id do usuário como chave, e só `auth.uid() = id` lê ou altera. A foto só pode ficar na pasta `<id do dono>/` do bucket. As funções de sessões não recebem id de usuário: usam `auth.uid()`, então pedir para encerrar a sessão de outra pessoa simplesmente não encontra nada.

Troca de e-mail e de senha vão direto para o Supabase Auth, que também identifica a conta só pelo token da sessão.

### O que precisa ser feito no Supabase

1. Rode `database/migrations/0005_profile.sql` no SQL Editor e depois o `checks/verificar_seguranca.sql` (tudo ✅).
2. **Authentication → URL Configuration → Redirect URLs**: acrescente `http://localhost:5173/profile`.
3. Recomendado: **Authentication → Sign In / Providers → Email**: ligue **Secure email change** e **Secure password change**.
4. Os e-mails de aviso de troca de e-mail e de senha já existem em [`docs/emails/`](docs/emails/README.md).

## Testes

Os testes rodam sem internet e **sem tocar no Supabase**: o login e o banco são simulados, então podem ser rodados quantas vezes quiser, sem criar nem apagar dados reais.

```bash
cd backend && npm test     # 337 testes
cd frontend && npm test    # 227 testes
```

Use `npm run test:watch` para rodar de novo a cada arquivo salvo.

**Backend** (Vitest + Supertest), em `backend/tests/`:

- `unit/validators.test.js` e `unit/date.test.js`: cada regra de validação (mês, ano, dinheiro, UUID, textos, tipo, datas inexistentes como 31/02) e o cálculo do último dia do mês.
- `unit/services.test.js`: **toda consulta filtra por `user_id`** e todo insert grava o dono do login, nunca o enviado; tradução dos erros do Postgres (nome repetido, categoria com gastos); somas por mês e por categoria; criação do mês sem duplicar quando chegam duas requisições juntas.
- `api/auth-and-security.test.js`: todas as rotas exigem login (sem token, token inválido, Supabase fora do ar); o backend usa a chave publishable com o token do usuário; `helmet`, CORS, JSON malformado, corpo acima de 10 kB e erro 500 sem detalhe em produção.
- `unit/mfa.test.js` e `api/mfa.test.js`: com app autenticador ativado, sessão só com senha (`aal1`) recebe 403 e não chega a consultar os dados; com o código (`aal2`) passa; sem app, nada muda.
- `api/rate-limit.test.js`: cada limite (rajada, volume, login inválido, gravações por usuário, teste do banco) devolve 429 com o tempo de espera; quem foi barrado não chega ao Supabase; GET não conta como gravação; cada usuário tem o seu contador; `X-Forwarded-For` só vale com `TRUST_PROXY`.
- `unit/fetchWithTimeout.test.js`: a chamada ao Supabase é cancelada quando passa do prazo.
- `api/profile.test.js` e `unit/profile.test.js` (Etapa 18): **o dono é sempre o usuário do token** — `id`/`user_id` de outra pessoa no corpo ou na query dá 403 sem tocar no banco, `/api/profile/<id>` não existe (404), o próprio id é ignorado; foto conferida pelos bytes (texto disfarçado de JPEG, GIF e SVG recusados; 2 MB no máximo; arquivo novo apagado se a gravação falhar); sessões (a atual não se encerra por ali; a de outra pessoa dá 404); telefone normalizado; e um teste que varre o código e falha se alguma mensagem de erro ficar sem tradução para o inglês.
- `api/finance.test.js`, `api/expenses.test.js`, `api/categories-and-budgets.test.js`: cada rota, com os casos de sucesso, de validação (400), de "não encontrado / de outra pessoa" (404), de categoria de outro usuário e de campos enviados pelo cliente que devem ser ignorados (`user_id`, `monthly_finance_id`).

**Frontend** (Vitest + Testing Library + jsdom), em `frontend/tests/`:

- `utils/`: leitura de valores digitados no formato brasileiro (`1.200,50`, `R$ 1.200`), formatação de moeda, somas em centavos, datas sem erro de fuso e tradução das mensagens do Supabase.
- `services/api.test.js`: envio do token, mensagens de erro, resposta sem corpo, backend desligado, aviso de 429 com o tempo de espera e leituras iguais agrupadas (sem reaproveitar leitura antiga depois de uma gravação).
- `components/SupabaseStatus.test.jsx`: o teste de conexão mostra o aviso de limite em vez de "não configurado".
- `components/`: formulários de salário e de gasto (validação, valores enviados, edição), rotas protegidas (sem login vai para o login), tela de cadastro (senha mínima de 8 caracteres), cabeçalho com menu de celular, seletor de mês, avisos rápidos, tela de carregamento entre páginas e a troca de mês no Resumo (inclusive quando uma resposta antiga chega atrasada).
- `utils/mfa.test.js` e `components/Mfa.test.jsx`: leitura do nível da sessão, a tela do código (certo, errado, sair) e ativar/cancelar/desativar em Configurações.
- `config/csp.test.js`, `components/Captcha.test.jsx` e `components/IdleLogout.test.jsx`: o que a CSP libera e bloqueia, o CAPTCHA travando o botão até a verificação e renovando o comprovante a cada tentativa, e a contagem de inatividade (aviso, saída só deste navegador, uso em outra aba, mensagem no login).
- `utils/month-and-theme.test.js`: cálculo do mês anterior/seguinte, mês na URL e escolha de tema.
- `i18n/i18n.test.jsx` (Etapa 18): português e inglês com as mesmas chaves e os mesmos `{parâmetros}`; moeda, datas, tipos e erros do Supabase em cada idioma; troca ao vivo; a API recebe o `Accept-Language`.
- `components/Profile.test.jsx`, `components/DashboardAlerts.test.jsx` e `utils/profile-utils.test.js` (Etapa 18): as três abas de Minha conta, **nenhuma requisição leva id de usuário**, foto, troca de e-mail, troca de senha (inclusive com o código de reautenticação), sessões, preferências salvas e desfeitas se o servidor recusar, e os avisos do Resumo ligando e desligando.
O que **não** é coberto aqui é o RLS do banco: ele foi testado à parte num PostgreSQL local (ver [`database/README.md`](database/README.md#testado-antes-da-entrega)) e pode ser conferido no Supabase com `database/checks/verificar_seguranca.sql`.

## Segurança

O que protege os dados:

- **RLS no banco**: cada usuário só lê e grava as próprias linhas, mesmo acessando a API do Supabase diretamente. Detalhes e testes em [`database/README.md`](database/README.md#segurança-etapa-12).
- **O backend nunca usa a chave secret.** Toda consulta é feita com o login do próprio usuário (o token que o frontend envia), então o RLS vale sempre.
- **Backend**: cabeçalhos de segurança (`helmet`), CORS liberado só para o `FRONTEND_URL`, limites de requisições por IP e por usuário (ver [Etapa 17](#resistência-a-excesso-de-requisições-etapa-17)), prazos para conexões lentas, corpo JSON de no máximo 10 kB e validação de todos os campos. Com `NODE_ENV=production`, os erros 500 não mostram detalhes técnicos.

### Ajustes no painel do Supabase (manual, uma vez)

1. **SQL Editor**: rode `database/migrations/0003_security_hardening.sql` e depois `database/checks/verificar_seguranca.sql`. Tudo deve aparecer com ✅.
2. **Authentication → Sign In / Providers → Email**: deixe **Confirm email** ligado e mude **Minimum password length** para **8**, o mesmo mínimo das telas de cadastro e de nova senha.
3. **Authentication → URL Configuration**: em **Site URL**, coloque `http://localhost:5173`. Em **Redirect URLs**, coloque `http://localhost:5173/reset-password`. Assim, o link de "esqueci minha senha" só leva de volta para o seu sistema.
4. **SQL Editor** (Etapa 15): rode `database/migrations/0004_mfa_enforcement.sql` e depois, de novo, o `verificar_seguranca.sql`.
   - **Etapa 18:** rode `database/migrations/0005_profile.sql` e depois, de novo, o `verificar_seguranca.sql`. Em **Authentication → URL Configuration → Redirect URLs**, acrescente `http://localhost:5173/profile` (para onde leva o link de confirmação da troca de e-mail).
5. **Authentication → Multi-Factor**: confira que **TOTP (App Authenticator)** está habilitado (é o padrão).
6. **Advisors → Security Advisor**: não deve sobrar nenhum item em vermelho (*Error*) nas tabelas do projeto.
7. Nunca coloque a chave **secret** (antiga `service_role`) em nenhum `.env` deste projeto. Ela ignora o RLS e o sistema não precisa dela.

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
- [x] Etapa 15 — Verificação em duas etapas (MFA)
- [x] Etapa 16 — Segurança avançada
- [x] Etapa 17 — Resistência a excesso de requisições
- [x] Etapa 18 — Minha conta (perfil, segurança e preferências)

As seções sobre configuração do Supabase, criação das tabelas, RLS e criação de usuário serão adicionadas aqui conforme cada etapa for concluída.
