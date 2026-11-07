import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import healthRoutes from './routes/health.routes.js'
import authRoutes from './routes/auth.routes.js'
import financeRoutes from './routes/finance.routes.js'
import categoryRoutes from './routes/category.routes.js'
import expenseRoutes from './routes/expense.routes.js'
import budgetRoutes from './routes/budget.routes.js'
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js'

const app = express()

// Cabeçalhos de segurança (bloqueia o uso da API dentro de iframes, desliga
// o "X-Powered-By: Express", força o navegador a respeitar o Content-Type etc.).
app.use(helmet())

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))

// Limite de requisições por IP: segura quem tentar martelar a API (cada
// requisição autenticada também consulta o Supabase para validar o token).
// 300 a cada 15 minutos é bem acima do que uma pessoa usando o sistema faz.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_MAX) || 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Muitas requisições em pouco tempo. Aguarde alguns minutos e tente de novo.' },
  })
)

// Os corpos desta API são pequenos (um gasto, um salário): 10 kB sobra.
app.use(express.json({ limit: '10kb' }))

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/budgets', budgetRoutes)

// Sempre por último: rota inexistente e tratamento central de erros.
app.use('/api', notFoundHandler)
app.use(errorHandler)

export default app
