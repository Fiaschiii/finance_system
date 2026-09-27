import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend do Controle Financeiro está no ar 🚀',
    timestamp: new Date().toISOString(),
  })
})

export default router
