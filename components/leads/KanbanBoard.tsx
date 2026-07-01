'use client'

import { useState } from 'react'

interface KanbanBoardProps {
  leads: any[]
  onLeadClick?: (lead: any) => void
}

const COLUMNS = [
  { id: 'new', label: '🆕 Nuevo' },
  { id: 'contacted', label: '📞 Contactado' },
  { id: 'consultation_scheduled', label: '📅 Consulta' },
  { id: 'consultation_completed', label: '✅ Completado' },
  { id: 'client_retained', label: '⭐ Retenido' },
  { id: 'lost', label: '❌ Perdido' },
]

export function KanbanBoard({ leads, onLeadClick }: KanbanBoardProps) {
  const [draggedLead, setDraggedLead] = useState<any>(null)

  const getLeadsByStatus = (status: string) => {
    return leads?.filter(l => l.status === status) || []
  }

  const handleDragStart = (e: React.DragEvent, lead: any) => {
    setDraggedLead(lead)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    if (draggedLead) {
      // Aquí actualizarías el estado del lead
      console.log('Mover lead:', draggedLead.id, 'a', status)
      setDraggedLead(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {COLUMNS.map((column) => {
        const columnLeads = getLeadsByStatus(column.id)
        
        return (
          <div
            key={column.id}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 min-h-[200px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm text-gray-600 dark:text-gray-300">
                {column.label}
              </h3>
              <span className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full text-xs">
                {columnLeads.length}
              </span>
            </div>

            {columnLeads.map((lead) => (
              <div
                key={lead.id}
                draggable
                onDragStart={(e) => handleDragStart(e, lead)}
                onClick={() => onLeadClick?.(lead)}
                className="bg-white dark:bg-gray-800 rounded p-3 mb-2 shadow-sm border dark:border-gray-600 cursor-pointer hover:shadow-md transition"
              >
                <div className="font-medium text-sm text-gray-800 dark:text-white">
                  {lead.first_name} {lead.last_name || ''}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {lead.case_type || 'Sin caso'}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  📞 {lead.phone}
                </div>
              </div>
            ))}

            {columnLeads.length === 0 && (
              <div className="text-center py-4 text-xs text-gray-400 dark:text-gray-500">
                Vacío
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}