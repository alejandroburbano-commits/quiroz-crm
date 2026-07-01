import { createClient } from '@supabase/supabase-js'

// Estas variables las configuraremos más adelante
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función para verificar la conexión
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('leads').select('count')
    if (error) throw error
    console.log('✅ Supabase conectado correctamente')
    return true
  } catch (error) {
    console.error('❌ Error conectando a Supabase:', error)
    return false
  }
}