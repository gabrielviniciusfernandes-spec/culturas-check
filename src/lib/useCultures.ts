import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { CultureWithRelations, ExamType, Patient } from '../types'

export function useCultures() {
  const [cultures, setCultures] = useState<CultureWithRelations[]>([])
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [culturesRes, examTypesRes, patientsRes] = await Promise.all([
      supabase
        .from('cultures')
        .select('*, patient:patients(*), exam_type:exam_types(*)')
        .eq('patient.archived', false)
        .order('expected_result_date', { ascending: true }),
      supabase.from('exam_types').select('*').order('sort_order', { ascending: true }),
      supabase.from('patients').select('*').eq('archived', false).order('name', { ascending: true }),
    ])

    if (culturesRes.error) setError(culturesRes.error.message)
    else setCultures((culturesRes.data ?? []).filter((c) => c.patient) as CultureWithRelations[])

    if (examTypesRes.error) setError(examTypesRes.error.message)
    else setExamTypes((examTypesRes.data ?? []) as ExamType[])

    if (patientsRes.error) setError(patientsRes.error.message)
    else setPatients((patientsRes.data ?? []) as Patient[])

    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { cultures, examTypes, patients, loading, error, reload }
}
