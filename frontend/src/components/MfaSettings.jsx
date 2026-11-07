import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useToast } from '../hooks/useToast.jsx'
import { translateAuthError } from '../utils/authErrors.js'
import { formatSecret, normalizeCode, qrCodeSrc } from '../utils/mfa.js'
import TotpCodeInput from './TotpCodeInput.jsx'
import Icon from './Icon.jsx'

// Configurações > Verificação em duas etapas.
// Ativar: o Supabase gera um QR Code; a pessoa lê com o app autenticador e
// digita o primeiro código para provar que deu certo. Só então o app fica
// valendo (antes disso ele é "não confirmado" e não muda nada no login).
function MfaSettings() {
  const { listFactors, enrollTotp, verifyTotp, unenrollFactor } = useAuth()
  const toast = useToast()
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [factor, setFactor] = useState(null) // app já confirmado
  const [enrollment, setEnrollment] = useState(null) // { id, qrCode, secret }
  const [code, setCode] = useState('')
  const [confirmingDisable, setConfirmingDisable] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data, error: listError } = await listFactors()
    if (listError) {
      setError(translateAuthError(listError.message))
      setStatus('error')
      return null
    }
    setFactor(data.totp[0] ?? null)
    setStatus('ready')
    return data
  }, [listFactors])

  useEffect(() => {
    load()
  }, [load])

  async function run(action) {
    setError('')
    setBusy(true)
    try {
      await action()
    } catch (err) {
      setError(translateAuthError(err.message))
    } finally {
      setBusy(false)
    }
  }

  const startEnrollment = () =>
    run(async () => {
      // Um cadastro que ficou pela metade (QR lido mas código nunca
      // confirmado) impede um novo com o mesmo nome: apaga antes.
      const data = await load()
      const leftovers = (data?.all ?? []).filter(
        (item) => item.factor_type === 'totp' && item.status === 'unverified'
      )
      for (const leftover of leftovers) {
        const { error: removeError } = await unenrollFactor(leftover.id)
        if (removeError) throw removeError
      }

      const { data: enrolled, error: enrollError } = await enrollTotp()
      if (enrollError) throw enrollError
      setCode('')
      setEnrollment({ id: enrolled.id, qrCode: enrolled.totp.qr_code, secret: enrolled.totp.secret })
    })

  const confirmEnrollment = (e) => {
    e.preventDefault()
    return run(async () => {
      const { error: verifyError } = await verifyTotp(enrollment.id, normalizeCode(code))
      if (verifyError) {
        setCode('')
        throw verifyError
      }
      setEnrollment(null)
      await load()
      toast('Verificação em duas etapas ativada.')
    })
  }

  const cancelEnrollment = () =>
    run(async () => {
      await unenrollFactor(enrollment.id)
      setEnrollment(null)
    })

  const disable = () =>
    run(async () => {
      const { error: removeError } = await unenrollFactor(factor.id)
      if (removeError) throw removeError
      setConfirmingDisable(false)
      await load()
      toast('Verificação em duas etapas desativada.')
    })

  return (
    <>
      <h2>Verificação em duas etapas</h2>
      <p>
        Além da senha, o login pede um código de 6 dígitos gerado por um app autenticador no seu celular
        (Microsoft Authenticator, Google Authenticator e parecidos). Mesmo que alguém descubra a sua senha,
        não entra sem o celular.
      </p>

      {status === 'loading' && <p className="status status--pending">Carregando…</p>}
      {error && <p className="status status--error">{error}</p>}

      {status === 'error' && (
        <button type="button" className="button button--ghost" onClick={() => run(load)} disabled={busy}>
          Tentar de novo
        </button>
      )}

      {status === 'ready' && factor && (
        <div className="mfa-box">
          <p className="status status--ok status--with-icon">
            <Icon name="shield" />
            <span>Ativada. O código do app é pedido sempre que você entra.</span>
          </p>
          {confirmingDisable ? (
            <span className="row-actions">
              <span>Desativar? O login volta a pedir só a senha.</span>
              <button
                type="button"
                className="action-button action-button--danger-solid"
                onClick={disable}
                disabled={busy}
              >
                Sim, desativar
              </button>
              <button
                type="button"
                className="action-button action-button--neutral"
                onClick={() => setConfirmingDisable(false)}
                disabled={busy}
              >
                Cancelar
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="action-button action-button--danger"
              onClick={() => setConfirmingDisable(true)}
            >
              Desativar
            </button>
          )}
        </div>
      )}

      {status === 'ready' && !factor && !enrollment && (
        <button type="button" className="button" onClick={startEnrollment} disabled={busy}>
          <Icon name="shield" size={16} /> {busy ? 'Gerando QR Code…' : 'Ativar'}
        </button>
      )}

      {enrollment && (
        <form className="mfa-box mfa-enroll" onSubmit={confirmEnrollment}>
          <ol className="mfa-steps">
            <li>
              No Microsoft Authenticator, toque em <strong>+</strong> e escolha{' '}
              <strong>Outra conta (Google, Facebook etc.)</strong>.
            </li>
            <li>Aponte a câmera para o QR Code abaixo.</li>
            <li>Digite aqui o código de 6 dígitos que aparecer no app.</li>
          </ol>
          <img className="mfa-qr" src={qrCodeSrc(enrollment.qrCode)} alt="QR Code para cadastrar no app autenticador" />
          <p className="mfa-secret">
            Não consegue ler o QR Code? Escolha digitar a chave e use:{' '}
            <code>{formatSecret(enrollment.secret)}</code>
          </p>
          <div className="auth-form mfa-code">
            <TotpCodeInput value={code} onChange={setCode} autoFocus />
          </div>
          <div className="form-actions">
            <button type="submit" className="button" disabled={busy || normalizeCode(code).length !== 6}>
              {busy ? 'Confirmando…' : 'Confirmar e ativar'}
            </button>
            <button type="button" className="button button--ghost" onClick={cancelEnrollment} disabled={busy}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </>
  )
}

export default MfaSettings
