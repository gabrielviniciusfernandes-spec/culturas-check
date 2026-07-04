import { useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    if (error) setError(error)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F7F3EC] to-[#EDE6D8] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="CulturasCheck" className="w-24 h-24 rounded-3xl shadow-card mb-4" />
          <h1 className="text-2xl font-semibold text-ink tracking-tight">CulturasCheck</h1>
          <p className="text-teal-500 text-sm mt-1">Identify · Diversify · Analyze</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/70 backdrop-blur-xl rounded-xl3 shadow-card p-6 space-y-4 border border-white/60"
        >
          <div>
            <label className="text-xs font-medium text-teal-600 ml-1">E-mail institucional</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@hospital.com"
              autoComplete="email"
              className="mt-1 w-full rounded-xl2 border border-teal-100 bg-white/80 px-4 py-2.5 text-ink placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-teal-600 ml-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl2 border border-teal-100 bg-white/80 px-4 py-2.5 text-ink placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl2 px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-500 hover:bg-teal-600 active:scale-[0.98] transition-all text-white font-medium rounded-xl2 py-2.5 shadow-soft disabled:opacity-60"
          >
            {submitting ? 'Aguarde…' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-teal-400 mt-6">
          Acesso restrito à equipe médica da enfermaria de transplantados.
          <br />
          As contas são criadas pelo administrador. Dados protegidos conforme a LGPD.
        </p>
      </div>
    </div>
  )
}
