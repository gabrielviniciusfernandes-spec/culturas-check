import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { todayISO, formatDateBR } from '../lib/dates'
import { useAuth } from '../contexts/AuthContext'
import type { Conduct, CultureWithRelations } from '../types'

interface Props {
  culture: CultureWithRelations
  onClose: () => void
  onUpdated: () => void
}

const CONDUCT_OPTIONS: { value: Conduct; label: string }[] = [
  { value: 'sem_conduta', label: 'Sem conduta' },
  { value: 'aguarda_conduta', label: 'Aguarda conduta' },
  { value: 'antibiotico', label: 'Antibiótico' },
]

export function CultureDetailModal({ culture, onClose, onUpdated }: Props) {
  const { user } = useAuth()

  const [collectionDate, setCollectionDate] = useState(culture.collection_date ?? '')
  const [expectedResultDate, setExpectedResultDate] = useState(culture.expected_result_date)
  const [delayReason, setDelayReason] = useState(culture.delay_reason ?? '')

  const [partialResult, setPartialResult] = useState(culture.partial_result ?? '')
  const [finalResult, setFinalResult] = useState(culture.final_result ?? '')

  const [conduct, setConduct] = useState<Conduct>(culture.conduct)
  const [conductDetail, setConductDetail] = useState(culture.conduct_detail ?? '')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSubmitting(true)

    try {
      const dateChanged = expectedResultDate !== culture.expected_result_date
      const conductChanged = conduct !== culture.conduct || conductDetail !== (culture.conduct_detail ?? '')

      const payload: Record<string, unknown> = {
        collection_date: collectionDate || null,
        expected_result_date: expectedResultDate,
        delay_reason: delayReason.trim() || null,
        partial_result: partialResult.trim() || null,
        partial_result_date: partialResult.trim() ? culture.partial_result_date ?? todayISO() : null,
        final_result: finalResult.trim() || null,
        final_result_date: finalResult.trim() ? culture.final_result_date ?? todayISO() : null,
        conduct,
        conduct_detail: conduct === 'antibiotico' ? conductDetail.trim() || null : null,
        updated_by: user.id,
      }

      if (dateChanged) payload.expected_result_edited = true
      if (conductChanged) payload.conduct_updated_at = new Date().toISOString().replace('Z', '+00:00')

      const { error } = await supabase.from('cultures').update(payload).eq('id', culture.id)
      if (error) throw error

      onUpdated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/30 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full sm:max-w-lg bg-white rounded-t-xl3 sm:rounded-xl3 shadow-card max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/90 backdrop-blur px-6 pt-6 pb-4 border-b border-teal-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">{culture.patient.name}</h2>
              <p className="text-sm text-teal-500">
                {culture.exam_type.name}
                {culture.custom_label ? ` · ${culture.custom_label}` : ''}
              </p>
            </div>
            <button onClick={onClose} className="text-teal-400 hover:text-teal-600 text-xl leading-none">
              ×
            </button>
          </div>
          <p className="text-xs text-teal-400 mt-2">
            Solicitado em {formatDateBR(culture.request_date)}
            {culture.patient.bed ? ` · Leito ${culture.patient.bed}` : ''}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-teal-600 ml-1">Data da coleta</label>
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="mt-1 w-full rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-teal-600 ml-1">Data prevista de checagem</label>
              <input
                type="date"
                value={expectedResultDate}
                onChange={(e) => setExpectedResultDate(e.target.value)}
                className="mt-1 w-full rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-teal-600 ml-1">Motivo do atraso (se a data foi alterada)</label>
            <input
              type="text"
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              placeholder="ex.: laboratório informou atraso na identificação"
              className="mt-1 w-full rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-teal-600 ml-1">Resultado parcial</label>
            <textarea
              value={partialResult}
              onChange={(e) => setPartialResult(e.target.value)}
              placeholder="ex.: cocos Gram positivos em cachos, aguardando identificação"
              rows={2}
              className="mt-1 w-full rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-teal-600 ml-1">Resultado final</label>
            <textarea
              value={finalResult}
              onChange={(e) => setFinalResult(e.target.value)}
              placeholder="ex.: Staphylococcus aureus, sensível a oxacilina"
              rows={2}
              className="mt-1 w-full rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-teal-600 ml-1">Conduta</label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {CONDUCT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setConduct(opt.value)}
                  className={`py-2 rounded-xl2 text-sm font-medium transition-all border ${
                    conduct === opt.value
                      ? 'bg-teal-500 text-white border-teal-500 shadow-soft'
                      : 'bg-white text-teal-600 border-teal-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {conduct === 'antibiotico' && (
              <input
                type="text"
                value={conductDetail}
                onChange={(e) => setConductDetail(e.target.value)}
                placeholder="Qual antibiótico / esquema"
                className="mt-2 w-full rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            )}
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl2 px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-500 hover:bg-teal-600 active:scale-[0.98] transition-all text-white font-medium rounded-xl2 py-2.5 shadow-soft disabled:opacity-60"
          >
            {submitting ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
