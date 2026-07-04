import { useMemo, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { computeExpectedResultDate, todayISO } from '../lib/dates'
import { useAuth } from '../contexts/AuthContext'
import type { ExamType, Patient } from '../types'

interface Props {
  examTypes: ExamType[]
  patients: Patient[]
  onClose: () => void
  onCreated: () => void
}

export function NewCultureModal({ examTypes, patients, onClose, onCreated }: Props) {
  const { user } = useAuth()
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>(patients.length ? 'existing' : 'new')
  const [patientId, setPatientId] = useState(patients[0]?.id ?? '')
  const [patientName, setPatientName] = useState('')
  const [bed, setBed] = useState('')

  const [examTypeId, setExamTypeId] = useState(examTypes[0]?.id ?? '')
  const [customLabel, setCustomLabel] = useState('')
  const [requestDate, setRequestDate] = useState(todayISO())
  const [collectionDate, setCollectionDate] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedExamType = useMemo(() => examTypes.find((e) => e.id === examTypeId), [examTypes, examTypeId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSubmitting(true)

    try {
      let finalPatientId = patientId

      if (patientMode === 'new') {
        if (!patientName.trim()) throw new Error('Informe o nome do paciente.')
        const { data, error } = await supabase
          .from('patients')
          .insert({ name: patientName.trim(), bed: bed.trim() || null, created_by: user.id })
          .select()
          .single()
        if (error) throw error
        finalPatientId = (data as Patient).id
      }

      if (!finalPatientId) throw new Error('Selecione um paciente.')
      if (!selectedExamType) throw new Error('Selecione o tipo de exame.')

      const baseDate = collectionDate || requestDate
      const expectedResultDate = computeExpectedResultDate(baseDate, selectedExamType.default_turnaround_days)

      const { error: cultureError } = await supabase.from('cultures').insert({
        patient_id: finalPatientId,
        exam_type_id: selectedExamType.id,
        custom_label: customLabel.trim() || null,
        request_date: requestDate,
        collection_date: collectionDate || null,
        expected_result_date: expectedResultDate,
        created_by: user.id,
      })
      if (cultureError) throw cultureError

      onCreated()
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
        <div className="sticky top-0 bg-white/90 backdrop-blur px-6 pt-6 pb-4 border-b border-teal-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Nova cultura / exame</h2>
          <button onClick={onClose} className="text-teal-400 hover:text-teal-600 text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <div className="flex bg-teal-50 rounded-full p-1 mb-3">
              <button
                type="button"
                onClick={() => setPatientMode('existing')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-full transition-all ${
                  patientMode === 'existing' ? 'bg-white shadow-soft text-ink' : 'text-teal-500'
                }`}
              >
                Paciente existente
              </button>
              <button
                type="button"
                onClick={() => setPatientMode('new')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-full transition-all ${
                  patientMode === 'new' ? 'bg-white shadow-soft text-ink' : 'text-teal-500'
                }`}
              >
                + Novo paciente
              </button>
            </div>

            {patientMode === 'existing' ? (
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="" disabled>
                  Selecione o paciente
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.bed ? ` — leito ${p.bed}` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nome do paciente"
                  className="col-span-2 rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <input
                  type="text"
                  value={bed}
                  onChange={(e) => setBed(e.target.value)}
                  placeholder="Leito"
                  className="rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-teal-600 ml-1">Tipo de exame</label>
            <select
              value={examTypeId}
              onChange={(e) => setExamTypeId(e.target.value)}
              className="mt-1 w-full rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {examTypes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            {selectedExamType?.notes && (
              <p className="text-xs text-teal-400 mt-1 ml-1">{selectedExamType.notes}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-teal-600 ml-1">Descrição adicional (opcional)</label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder='ex.: "ponta de cateter", "sítio cirúrgico"'
              className="mt-1 w-full rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-teal-600 ml-1">Data da solicitação</label>
              <input
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                className="mt-1 w-full rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-teal-600 ml-1">Data da coleta (se já feita)</label>
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="mt-1 w-full rounded-xl2 border border-teal-100 bg-white px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl2 px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-500 hover:bg-teal-600 active:scale-[0.98] transition-all text-white font-medium rounded-xl2 py-2.5 shadow-soft disabled:opacity-60"
          >
            {submitting ? 'Salvando…' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  )
}
