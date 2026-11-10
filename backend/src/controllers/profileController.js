import * as profileService from '../services/profileService.js'
import { asyncHandler } from '../middlewares/errorHandler.js'
import { hasVerifiedFactor } from '../utils/mfa.js'
import {
  ValidationError,
  parseText,
  parsePhone,
  parseOneOf,
  parseBoolean,
  parseUuid,
} from '../utils/validators.js'

export const LANGUAGES = ['pt-BR', 'en']
export const THEMES = ['auto', 'light', 'dark']
const NOTIFICATIONS = ['notify_budget_alerts', 'notify_missing_salary', 'notify_mfa_reminder']

// Lista fechada do que o cliente pode mudar. Qualquer outro campo é ignorado
// (avatar_path, created_at...). Id de usuário nem chega aqui: o middleware
// rejectForeignUserId já recusou se fosse de outra pessoa.
function parseProfileFields(body = {}) {
  const fields = {}
  const sent = (key) => body[key] !== undefined

  if (sent('full_name')) {
    fields.full_name = parseText(body.full_name, 'Nome', { max: 100, required: false })
  }
  if (sent('phone')) fields.phone = parsePhone(body.phone)
  if (sent('language')) fields.language = parseOneOf(body.language, LANGUAGES, 'Idioma')
  if (sent('theme')) fields.theme = parseOneOf(body.theme, THEMES, 'Tema')
  for (const key of NOTIFICATIONS) {
    if (sent(key)) fields[key] = parseBoolean(body[key], 'Preferência de aviso')
  }

  if (Object.keys(fields).length === 0) {
    throw new ValidationError('Informe ao menos um campo para atualizar.')
  }
  return fields
}

// O que o frontend recebe: dados do perfil + o que vem do login (e-mail,
// troca de e-mail pendente, MFA). O caminho interno da foto não sai daqui:
// vai só o link temporário.
async function toResponse(req, profile) {
  const { avatar_path: avatarPath, ...rest } = profile
  return {
    ...rest,
    email: req.user.email ?? null,
    new_email: req.user.new_email ?? null,
    mfa_enabled: hasVerifiedFactor(req.user),
    avatar_url: await profileService.signAvatarUrl(req.supabase, req.user.id, avatarPath),
  }
}

// GET /api/profile
export const get = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.supabase, req.user.id)
  res.json({ profile: await toResponse(req, profile) })
})

// PUT /api/profile  (só os campos enviados)
export const update = asyncHandler(async (req, res) => {
  const fields = parseProfileFields(req.body)
  const profile = await profileService.updateProfile(req.supabase, req.user.id, fields)
  res.json({ profile: await toResponse(req, profile) })
})

// ----------------------------- Foto -----------------------------

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024

// Confere o tipo pelos primeiros bytes do arquivo (a "assinatura"), não pelo
// nome nem pelo Content-Type, que o cliente escolhe livremente.
export function detectImageType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { contentType: 'image/jpeg', extension: 'jpg' }
  }
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { contentType: 'image/png', extension: 'png' }
  }
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { contentType: 'image/webp', extension: 'webp' }
  }
  return null
}

// PUT /api/profile/avatar  (corpo = a imagem, Content-Type image/jpeg|png|webp)
export const uploadAvatar = asyncHandler(async (req, res) => {
  const type = detectImageType(req.body)
  if (!type) {
    throw new ValidationError('Foto inválida: envie uma imagem JPEG, PNG ou WebP.')
  }

  const current = await profileService.getProfile(req.supabase, req.user.id)
  const path = await profileService.uploadAvatar(req.supabase, req.user.id, { buffer: req.body, ...type })

  let profile
  try {
    profile = await profileService.updateProfile(req.supabase, req.user.id, { avatar_path: path })
  } catch (error) {
    // Não deixa o arquivo novo perdido no bucket.
    await profileService.removeAvatarFile(req.supabase, req.user.id, path)
    throw error
  }

  await profileService.removeAvatarFile(req.supabase, req.user.id, current.avatar_path)
  res.json({ profile: await toResponse(req, profile) })
})

// DELETE /api/profile/avatar
export const removeAvatar = asyncHandler(async (req, res) => {
  const current = await profileService.getProfile(req.supabase, req.user.id)
  const profile = await profileService.updateProfile(req.supabase, req.user.id, { avatar_path: null })
  await profileService.removeAvatarFile(req.supabase, req.user.id, current.avatar_path)
  res.json({ profile: await toResponse(req, profile) })
})

// ---------------------------- Sessões ----------------------------

// GET /api/profile/sessions
export const listSessions = asyncHandler(async (req, res) => {
  const sessions = await profileService.listSessions(req.supabase)
  res.json({ sessions })
})

// DELETE /api/profile/sessions/:sessionId
export const revokeSession = asyncHandler(async (req, res) => {
  const sessionId = parseUuid(req.params.sessionId, 'Sessão inválida.')
  if (sessionId === req.sessionId) {
    throw new ValidationError('Para encerrar a sessão atual, use o botão Sair.')
  }

  const revoked = await profileService.revokeSession(req.supabase, sessionId)
  if (!revoked) {
    return res.status(404).json({ error: 'Sessão não encontrada.' })
  }
  res.status(204).end()
})

// DELETE /api/profile/sessions  (todas, menos a atual)
export const revokeOtherSessions = asyncHandler(async (req, res) => {
  const revoked = await profileService.revokeOtherSessions(req.supabase)
  res.json({ revoked })
})
