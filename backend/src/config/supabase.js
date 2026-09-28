import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null