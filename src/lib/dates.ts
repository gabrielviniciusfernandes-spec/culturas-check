import type { Culture, CultureStatus } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(dateISO: string, days: number): string {
  const d = new Date(dateISO + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + 'T00:00:00').getTime()
  const to = new Date(toISO + 'T00:00:00').getTime()
  return Math.round((to - from) / DAY_MS)
}

export function formatDateBR(dateISO: string | null): string {
  if (!dateISO) return '—'
  const [y, m, d] = dateISO.split('-')
  return `${d}/${m}/${y}`
}

/** Calcula a data esperada de checagem a partir da data de coleta (ou solicitação) + prazo padrão do exame. */
export function computeExpectedResultDate(baseDateISO: string, turnaroundDays: number): string {
  return addDays(baseDateISO, turnaroundDays)
}

export function getCultureStatus(culture: Culture, today: string = todayISO()): CultureStatus {
  if (culture.final_result) return 'concluido'
  if (culture.partial_result) return 'resultado_parcial'
  if (!culture.collection_date) return 'aguardando_coleta'

  const diff = daysBetween(today, culture.expected_result_date)
  if (diff > 0) return 'em_andamento'
  if (diff === 0) return 'checar_hoje'
  return 'atrasado'
}

export const STATUS_LABELS: Record<CultureStatus, string> = {
  aguardando_coleta: 'Aguardando coleta',
  em_andamento: 'Em andamento',
  checar_hoje: 'Checar hoje',
  atrasado: 'Atrasado',
  resultado_parcial: 'Resultado parcial',
  concluido: 'Concluído',
}

export const STATUS_ORDER: CultureStatus[] = [
  'atrasado',
  'checar_hoje',
  'resultado_parcial',
  'em_andamento',
  'aguardando_coleta',
  'concluido',
]

export const CONDUCT_LABELS: Record<string, string> = {
  sem_conduta: 'Sem conduta',
  aguarda_conduta: 'Aguarda conduta',
  antibiotico: 'Antibiótico',
}
