import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { Lead } from '@/types'

// Hook para manejar Leads
export function useLeads() {
  const queryClient = useQueryClient()

  // 🔍 Obtener todos los leads
  const { 
    data: leads, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error al obtener leads:', error)
        throw error
      }
      
      return data as Lead[]
    },
    // Refrescar cada 30 segundos (para sincronización)
    refetchInterval: 30000,
  })

  // ➕ Crear un nuevo lead
  const createLead = useMutation({
    mutationFn: async (newLead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([newLead])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Refrescar la lista de leads
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('✅ Lead creado exitosamente')
    },
    onError: (error: any) => {
      toast.error(`❌ Error al crear: ${error.message}`)
      console.error(error)
    }
  })

  // ✏️ Actualizar un lead
  const updateLead = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('✅ Lead actualizado')
    },
    onError: (error: any) => {
      toast.error(`❌ Error al actualizar: ${error.message}`)
      console.error(error)
    }
  })

  // 🗑️ Eliminar un lead
  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('🗑️ Lead eliminado')
    },
    onError: (error: any) => {
      toast.error(`❌ Error al eliminar: ${error.message}`)
      console.error(error)
    }
  })

  return {
    leads,
    isLoading,
    error,
    refetch,
    createLead: createLead.mutateAsync,
    updateLead: updateLead.mutateAsync,
    deleteLead: deleteLead.mutateAsync,
    isCreating: createLead.isPending,
    isUpdating: updateLead.isPending,
    isDeleting: deleteLead.isPending
  }
}