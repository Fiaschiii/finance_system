import { Router } from 'express'
import { isSupabaseConfigured } from '../config/supabase.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend do Controle Financeiro está no ar 🚀',
    timestamp: new Date().toISOString(),
  })
})

router.get('/supabase', async (req, res) => {
  if (!isSupabaseConfigured) {
    return res.json({
      configured: false,
      message: 'Preencha SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY em backend/.env',
    })
  }

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: process.env.SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_PUBLISHABLE_KEY}`,
      },
    })

    res.json({
      configured: true,
      reachable: response.ok,
      httpStatus: response.status,
    })
  } catch (error) {
    res.json({
      configured: true,
      reachable: false,
      error: error.message,
    })
  }
})

export default router