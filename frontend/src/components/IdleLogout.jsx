import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useIdleTimer } from '../hooks/useIdleTimer.js'
import { IDLE_TIMEOUT_MINUTES, IDLE_WARNING_SECONDS } from '../config/security.js'

// Avisa a tela de login do motivo da saída (sobrevive à troca de página).
export const LOGOUT_REASON_KEY = 'motivo-saida'

// Encerra a sessão depois de IDLE_TIMEOUT_MINUTES sem uso, com um aviso
// IDLE_WARNING_SECONDS antes. Protege quem esquece o sistema aberto num
// computador compartilhado.
function IdleLogout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const buttonRef = useRef(null)

  const { secondsLeft, stayActive } = useIdleTimer({
    enabled: Boolean(user),
    timeoutMs: IDLE_TIMEOUT_MINUTES * 60 * 1000,
    warningMs: IDLE_WARNING_SECONDS * 1000,
    onTimeout: async () => {
      try {
        sessionStorage.setItem(LOGOUT_REASON_KEY, 'idle')
      } catch {
        // sem sessionStorage: só não mostra o motivo
      }
      // 'local': sai só deste navegador, sem derrubar outros aparelhos.
      await signOut({ scope: 'local' })
      navigate('/login', { replace: true })
    },
  })

  const open = secondsLeft !== null
  useEffect(() => {
    if (open) buttonRef.current?.focus()
  }, [open])

  if (!open) return null

  async function handleLeave() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="modal-backdrop">
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="idle-title"
        aria-describedby="idle-text"
      >
        <h2 id="idle-title">Você ainda está aí?</h2>
        <p id="idle-text">
          Por segurança, a sessão será encerrada em <strong>{secondsLeft} s</strong> por falta de uso.
        </p>
        <div className="form-actions">
          <button ref={buttonRef} type="button" className="button" onClick={stayActive}>
            Continuar conectado
          </button>
          <button type="button" className="button button--ghost" onClick={handleLeave}>
            Sair agora
          </button>
        </div>
      </div>
    </div>
  )
}

export default IdleLogout
