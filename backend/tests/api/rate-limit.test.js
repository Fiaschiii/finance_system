import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'

describe('limite de requisições', () => {
  it('a partir do limite, responde 429 com mensagem em português', async () => {
    vi.stubEnv('RATE_LIMIT_MAX', '3')
    vi.resetModules()
    const { default: app } = await import('../../src/app.js')

    for (let i = 0; i < 3; i++) {
      expect((await request(app).get('/api/health')).status).toBe(200)
    }
    const blocked = await request(app).get('/api/health')
    expect(blocked.status).toBe(429)
    expect(blocked.body.error).toMatch(/Muitas requisições/)
    vi.unstubAllEnvs()
  })
})
