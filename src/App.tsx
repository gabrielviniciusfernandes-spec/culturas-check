import { useAuth } from './contexts/AuthContext'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EC]">
        <p className="text-teal-400">Carregando…</p>
      </div>
    )
  }

  return session ? <Dashboard /> : <Login />
}
