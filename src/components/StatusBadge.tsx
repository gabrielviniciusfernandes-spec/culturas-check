import type { CultureStatus } from '../types'
import { STATUS_LABELS } from '../lib/dates'

const STYLES: Record<CultureStatus, string> = {
  atrasado: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  checar_hoje: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  resultado_parcial: 'bg-purple-50 text-purple-600 ring-1 ring-purple-200',
  em_andamento: 'bg-teal-50 text-teal-600 ring-1 ring-teal-200',
  aguardando_coleta: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
  concluido: 'bg-green-50 text-green-600 ring-1 ring-green-200',
}

export function StatusBadge({ status }: { status: CultureStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
