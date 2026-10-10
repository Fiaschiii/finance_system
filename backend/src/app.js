import express from 'express'
import cors from 'cors'
import healthRoutes from './routes/health.routes.js'
import authRoutes from './routes/auth.routes.js'
import financeRoutes from './routes/finance.routes.js'
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js'

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/finance', financeRoutes)

// Sempre por último: rota inexistente e tratamento central de erros.
app.use('/api', notFoundHandler)
app.use(errorHandler)

export default app
