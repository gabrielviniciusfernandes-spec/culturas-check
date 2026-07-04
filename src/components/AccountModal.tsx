import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  onClose: () => void
}

export function AccountModal({ onClose }: Props) {
  const { user, profile, reloadProfile } = useAuth()

  // --- nome ---
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [nameMsg, setNameMsg] = useState<string | null>(null)
  const [nameErr, setNameErr] = useState<string | null>(null)

  // --- senha ---
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPass, setSavingPass] = useState(false)
  const [passMsg, setPassMsg] = useState<string | null>(null)
  const [passErr, setPassErr] = useState<string | null>(null)

  async function handleSaveName(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setNameErr(null)
    setNameMsg(null)
    if (!fullName.trim()) {
      setNameErr('Informe seu nome.')
      return
    }
    setSavingName(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', user.id)
    if (error) {
      setNameErr(error.message)
    } else {
      await reloadProfile()
      setNameMsg('Nome atualizado.')
    }
    setSavingName(false)
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    if (!user?.email) return
    setPassErr(null)
    setPassMsg(null)

    if (newPassword.length < 6) {
      setPassErr('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPassErr('A confirmação não confere com a nova senha.')
      return
    }
    if (newPassword === currentPassword) {
      setPassErr('A nova senha deve ser diferente da atual.')
      return
    }

    setSavingPass(true)

    // 1) re-autentica para confirmar a senha atual
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })
    if (reauthError) {
      setPassErr('Senha atual incorreta.')
      setSavingPass(false)
      return
    }

    // 2) atualiza a senha
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) {
      setPassErr(updateError.message)
    } else {
      setPassMsg('Senha alterada com sucesso.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setSavingPass(false)
  }

  const inputCls =
    'mt-1 w-full rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/30 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-xl3 sm:rounded-xl3 shadow-card max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/90 backdrop-blur px-6 pt-6 pb-4 border-b border-teal-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Minha conta</h2>
            <p className="text-sm text-teal-500">{user?.email}</p>
          </div>
          <button onClick={onClose} className="text-teal-400 hover:text-teal-600 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Nome */}
          <form onSubmit={handleSaveName} className="space-y-3">
            <h3 className="text-sm font-semibold text-teal-600">Nome de exibição</h3>
            <div>
              <label className="text-xs font-medium text-teal-600 ml-1">Nome completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dra. Ana Souza"
                className={inputCls}
              />
            </div>
            {nameErr && <p className="text-sm text-red-500 bg-red-50 rounded-xl2 px-3 py-2">{nameErr}</p>}
            {nameMsg && <p className="text-sm text-teal-700 bg-teal-50 rounded-xl2 px-3 py-2">{nameMsg}</p>}
            <button
              type="submit"
              disabled={savingName}
              className="w-full bg-teal-500 hover:bg-teal-600 active:scale-[0.98] transition-all text-white font-medium rounded-xl2 py-2.5 shadow-soft disabled:opacity-60"
            >
              {savingName ? 'Salvando…' : 'Salvar nome'}
            </button>
          </form>

          {/* Senha */}
          <form onSubmit={handleChangePassword} className="space-y-3 pt-6 border-t border-teal-50">
            <h3 className="text-sm font-semibold text-teal-600">Alterar senha</h3>
            <div>
              <label className="text-xs font-medium text-teal-600 ml-1">Senha atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-teal-600 ml-1">Nova senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="mínimo 6 caracteres"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-teal-600 ml-1">Confirmar nova senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="repita a nova senha"
                className={inputCls}
              />
            </div>
            {passErr && <p className="text-sm text-red-500 bg-red-50 rounded-xl2 px-3 py-2">{passErr}</p>}
            {passMsg && <p className="text-sm text-teal-700 bg-teal-50 rounded-xl2 px-3 py-2">{passMsg}</p>}
            <button
              type="submit"
              disabled={savingPass}
              className="w-full bg-teal-500 hover:bg-teal-600 active:scale-[0.98] transition-all text-white font-medium rounded-xl2 py-2.5 shadow-soft disabled:opacity-60"
            >
              {savingPass ? 'Alterando…' : 'Alterar senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
