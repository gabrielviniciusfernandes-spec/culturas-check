import { formatDateBR, getCultureStatus, CONDUCT_LABELS } from '../lib/dates'
import { StatusBadge } from './StatusBadge'
import type { CultureWithRelations } from '../types'

interface Props {
  culture: CultureWithRelations
  onClick: () => void
}

export function CultureCard({ culture, onClick }: Props) {
  const status = getCultureStatus(culture)

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl2 shadow-soft border border-teal-50 p-4 hover:shadow-card hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-ink truncate">{culture.patient.name}</p>
          <p className="text-sm text-teal-500 truncate">
            {culture.exam_type.name}
            {culture.custom_label ? ` · ${culture.custom_label}` : ''}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-teal-400">
        <span>
          {culture.patient.bed ? `Leito ${culture.patient.bed} · ` : ''}
          Prevista: {formatDateBR(culture.expected_result_date)}
          {culture.expected_result_edited && ' (ajustada)'}
        </span>
        <span className="font-medium text-teal-600">{CONDUCT_LABELS[culture.conduct]}</span>
      </div>
    </button>
  )
}
