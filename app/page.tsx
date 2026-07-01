'use client'

import { useState, useEffect, useRef } from 'react'
import { useLeads } from '@/hooks/useLeads'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// ============================================================
// TYPES
// ============================================================
interface Task {
  id: string
  text: string
  done: boolean
  assignedTo: string
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  createdAt: string
  createdBy: string
}

interface Lead {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string
  status: string
  priority: string
  case_type: string | null
  assigned_to: string | null
  notes: string | null
  alien_number: string | null
  receipt_number: string | null
  court: string | null
  judge: string | null
  next_hearing: string | null
  deadline: string | null
  tags: string[]
  created_at: string
  tasks?: Task[]      // ← Ahora Task está definida
  activities?: Activity[]  // ← Ahora Activity está definida
}
interface Lead {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string
  status: string
  priority: string
  case_type: string | null
  assigned_to: string | null
  notes: string | null
  alien_number: string | null
  receipt_number: string | null
  court: string | null
  judge: string | null
  next_hearing: string | null
  deadline: string | null
  tags: string[]
  created_at: string
  tasks?: Task[]
  activities?: Activity[]
}

// ... (más interfaces)

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Home() {
  // ... todo el código
}

//