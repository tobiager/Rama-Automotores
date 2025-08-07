import { supabase } from './supabase'

export interface Cotizacion {
  id: number
  mes: number
  anio: number
  nombre_archivo: string
  url: string
  estado: 'procesando' | 'completado' | 'error'
  fecha_subida: string
  total_modelos?: number
}

export interface ModeloAuto {
  id: number
  marca: string
  modelo: string
  anio: number
  precio: number
  descripcion?: string
}

// Función principal para obtener cotizaciones
export async function getCotizaciones(): Promise<Cotizacion[]> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .order('fecha_subida', { ascending: false })

    if (error) {
      console.error('Error fetching cotizaciones:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getCotizaciones:', error)
    return []
  }
}

// Alias para getAllCotizaciones (requerido por deployment)
export const getAllCotizaciones = getCotizaciones

// Función para obtener cotización por período
export async function getCotizacionByPeriod(mes: number, anio: number): Promise<Cotizacion | null> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('mes', mes)
      .eq('anio', anio)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No data found
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching cotizacion by period:', error)
    return null
  }
}

// Función para obtener la cotización más reciente
export async function getLatestCotizacion(): Promise<Cotizacion | null> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('estado', 'completado')
      .order('fecha_subida', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No data found
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching latest cotizacion:', error)
    return null
  }
}

// Función para subir nueva cotización
export async function uploadCotizacionPDF(
  file: File,
  mes: number,
  anio: number
): Promise<{ success: boolean; message: string; cotizacion?: Cotizacion }> {
  try {
    // Validate file
    if (!file || file.type !== 'application/pdf') {
      return { success: false, message: 'El archivo debe ser un PDF válido' }
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { success: false, message: 'El archivo no puede superar los 10MB' }
    }

    // Check if cotizacion already exists
    const existing = await getCotizacionByPeriod(mes, anio)
    if (existing) {
      return { success: false, message: 'Ya existe una cotización para este período' }
    }

    // Generate filename
    const fileName = `${anio}-${mes.toString().padStart(2, '0')}-cotizacion.pdf`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cotizaciones')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, message: 'Error al subir el archivo' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('cotizaciones')
      .getPublicUrl(fileName)

    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from('cotizaciones')
      .insert({
        mes,
        anio,
        nombre_archivo: fileName,
        url: urlData.publicUrl,
        estado: 'completado'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Cleanup uploaded file
      await supabase.storage.from('cotizaciones').remove([fileName])
      return { success: false, message: 'Error al guardar en la base de datos' }
    }

    return { 
      success: true, 
      message: 'Cotización subida exitosamente',
      cotizacion: dbData
    }
  } catch (error) {
    console.error('Error in uploadCotizacionPDF:', error)
    return { success: false, message: 'Error interno del servidor' }
  }
}

// Función para reemplazar cotización existente
export async function replaceCotizacion(
  id: number,
  file: File,
  mes: number,
  anio: number
): Promise<{ success: boolean; message: string }> {
  try {
    // Get existing cotizacion
    const { data: existing, error: fetchError } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return { success: false, message: 'Cotización no encontrada' }
    }

    // Generate new filename
    const fileName = `${anio}-${mes.toString().padStart(2, '0')}-cotizacion.pdf`

    // Upload new file
    const { error: uploadError } = await supabase.storage
      .from('cotizaciones')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Replace if exists
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, message: 'Error al subir el archivo' }
    }

    // Get new public URL
    const { data: urlData } = supabase.storage
      .from('cotizaciones')
      .getPublicUrl(fileName)

    // Update database
    const { error: updateError } = await supabase
      .from('cotizaciones')
      .update({
        mes,
        anio,
        nombre_archivo: fileName,
        url: urlData.publicUrl,
        estado: 'completado'
      })
      .eq('id', id)

    if (updateError) {
      console.error('Update error:', updateError)
      return { success: false, message: 'Error al actualizar la base de datos' }
    }

    // Remove old file if different
    if (existing.nombre_archivo !== fileName) {
      await supabase.storage
        .from('cotizaciones')
        .remove([existing.nombre_archivo])
    }

    return { success: true, message: 'Cotización reemplazada exitosamente' }
  } catch (error) {
    console.error('Error in replaceCotizacion:', error)
    return { success: false, message: 'Error interno del servidor' }
  }
}

// Función para eliminar cotización
export async function deleteCotizacion(id: number): Promise<{ success: boolean; message: string }> {
  try {
    // Get cotizacion details
    const { data: cotizacion, error: fetchError } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !cotizacion) {
      return { success: false, message: 'Cotización no encontrada' }
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('cotizaciones')
      .remove([cotizacion.nombre_archivo])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('cotizaciones')
      .delete()
      .eq('id', id)

    if (dbError) {
      console.error('Database deletion error:', dbError)
      return { success: false, message: 'Error al eliminar de la base de datos' }
    }

    return { success: true, message: 'Cotización eliminada exitosamente' }
  } catch (error) {
    console.error('Error in deleteCotizacion:', error)
    return { success: false, message: 'Error interno del servidor' }
  }
}

// Placeholder functions for future implementation
export async function searchModelos(query: string): Promise<string[]> {
  // TODO: Implement PDF content search
  console.log('Searching for models:', query)
  return []
}

export async function processPDFContent(url: string): Promise<{ models: string[]; totalModels: number }> {
  // TODO: Implement PDF content processing
  console.log('Processing PDF content from:', url)
  return { models: [], totalModels: 0 }
}

// Utility functions
export function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[month - 1] || 'Mes inválido'
}

export function formatPeriod(mes: number, anio: number): string {
  return `${getMonthName(mes)} ${anio}`
}
