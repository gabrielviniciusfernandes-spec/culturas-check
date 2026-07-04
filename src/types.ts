export type ExamCategory = 'bacteriologia' | 'micobacteria' | 'fungos'

export interface ExamType {
  id: string
  code: string
  name: string
  category: ExamCategory
  default_turnaround_days: number
  notes: string | null
  sort_order: number
}

export interface Patient {
  id: string
  name: string
  bed: string | null
  medical_record: string | null
  created_by: string
  created_at: string
  updated_at: string
  archived: boolean
}

export type Conduct = 'sem_conduta' | 'aguarda_conduta' | 'antibiotico'

export interface Culture {
  id: string
  patient_id: string
  exam_type_id: string
  custom_label: string | null

  request_date: string
  collection_date: string | null
  expected_result_date: string
  expected_result_edited: boolean
  delay_reason: string | null

  partial_result: string | null
  partial_result_date: string | null
  final_result: string | null
  final_result_date: string | null

  conduct: Conduct
  conduct_detail: string | null
  conduct_updated_at: string | null

  created_by: string
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface CultureWithRelations extends Culture {
  patient: Patient
  exam_type: ExamType
}

export type CultureStatus =
  | 'aguardando_coleta'
  | 'em_andamento'
  | 'checar_hoje'
  | 'atrasado'
  | 'resultado_parcial'
  | 'concluido'

export interface Profile {
  id: string
  full_name: string
  crm: string | null
  created_at: string
}
