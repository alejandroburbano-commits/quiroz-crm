// Definición de Lead (cliente potencial)
export interface Lead {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string
  language: string | null
  country: string | null
  source: string | null
  status: string
  priority: string
  assigned_to: string | null
  case_type: string | null
  notes: string | null
  tags: string[]
  alien_number: string | null
  receipt_number: string | null
  court: string | null
  judge: string | null
  next_hearing: string | null
  deadline: string | null
  created_at: string
  updated_at: string
}

// Definición de Usuario
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
  created_at: string
}

// Definición de Tarea
export interface Task {
  id: string
  lead_id: string
  title: string
  description: string | null
  assigned_to: string | null
  priority: string
  status: string
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// Definición de Caso USCIS
export interface USCISCase {
  id: string
  lead_id: string
  receipt_number: string
  form_type: string
  service_center: string | null
  status: string
  filed_date: string | null
  biometrics_date: string | null
  interview_date: string | null
  decision_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}