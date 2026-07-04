import { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCultures } from '../lib/useCultures'
import { STATUS_LABELS, STATUS_ORDER, getCultureStatus } from '../lib/dates'
import { CultureCard } from './CultureCard'
import { NewCultureModal } from './NewCultureModal'
import { CultureDetailModal } from './CultureDetailModal'
import type { CultureStatus, CultureWithRelations } from '../types'

export function Dashboard() {
  const { profile, signOut } = useAuth()
  const { cultures, examTypes, patients, loading, error, reload } = useCultures()
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState<CultureWithRelations | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return cultures
    const q = search.trim().toLowerCase()
    return cultures.filter(
      (c) => c.patient.name.toLowerCase().includes(q) || (c.patient.bed ?? '').toLowerCase().includes(q)
    )
  }, [cultures, search])

  const grouped = useMemo(() => {
    const map = new Map<CultureStatus, CultureWithRelations[]>()
    for (const status of STATUS_ORDER) map.set(status, [])
    for (const culture of filtered) {
      const status = getCultureStatus(culture)
      map.get(status)?.push(culture)
    }
    return map
  }, [filtered])

  const alertCount = (grouped.get('atrasado')?.length ?? 0) + (grouped.get('checar_hoje')?.length ?? 0)

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <header className="sticky top-0 z-30 bg-[#F7F3EC]/80 backdrop-blur-xl border-b border-teal-100/60">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.svg" alt="" className="w-9 h-9 rounded-xl shadow-soft shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-ink leading-tight truncate">CulturasCheck</h1>
              <p className="text-xs text-teal-500 truncate">{profile?.full_name ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {alertCount > 0 && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                {alertCount} para checar
              </span>
            )}
            <button
              onClick={() => setShowNew(true)}
              className="bg-teal-500 hover:bg-teal-600 active:scale-[0.98] transition-all text-white text-sm font-medium rounded-full px-4 py-2 shadow-soft"
            >
              + Novo
            </button>
            <button
              onClick={signOut}
              className="text-teal-400 hover:text-teal-600 text-sm px-2"
              title="Sair"
            >
              Sair
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar paciente ou leito…"
            className="w-full rounded-full border border-teal-100 bg-white/80 px-4 py-2 text-sm text-ink placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {loading && <p className="text-center text-teal-400 py-12">Carregando…</p>}
        {error && <p className="text-center text-red-500 bg-red-50 rounded-xl2 py-3 px-4">{error}</p>}

        {!loading && !error && cultures.length === 0 && (
          <div className="text-center py-20">
            <p className="text-teal-400">Nenhuma cultura cadastrada ainda.</p>
            <button
              onClick={() => setShowNew(true)}
              className="mt-4 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-full px-5 py-2.5 shadow-soft"
            >
              Cadastrar primeira cultura
            </button>
          </div>
        )}

        {!loading &&
          STATUS_ORDER.map((status) => {
            const items = grouped.get(status) ?? []
            if (items.length === 0) return null
            return (
              <section key={status}>
                <h2 className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-3">
                  {STATUS_LABELS[status]} <span className="text-teal-300 font-normal">· {items.length}</span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((culture) => (
                    <CultureCard key={culture.id} culture={culture} onClick={() => setSelected(culture)} />
                  ))}
                </div>
              </section>
            )
          })}
      </main>

      {showNew && (
        <NewCultureModal
          examTypes={examTypes}
          patients={patients}
          onClose={() => setShowNew(false)}
          onCreated={reload}
        />
      )}

      {selected && (
        <CultureDetailModal
          culture={selected}
          onClose={() => setSelected(null)}
          onUpdated={reload}
          onDeleted={reload}
        />
      )}
    </div>
  )
}
