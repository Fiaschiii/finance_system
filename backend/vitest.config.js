import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['tests/helpers/setup.js'],
    // Valores falsos: nenhum teste fala com o Supabase de verdade.
    env: {
      SUPABASE_URL: 'https://projetoteste.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_teste',
      FRONTEND_URL: 'http://localhost:5173',
      NODE_ENV: 'test',
    },
    restoreMocks: true,
  },
})
