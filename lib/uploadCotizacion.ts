import { supabase } from './supabase'
import { getCotizaciones, getCotizacionByPeriod, type Cotizacion } from './cotizaciones'

export interface UploadResult {
  success: boolean
  error?: string
  message?: string
  cotizacion?: Cotizacion
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export async function uploadCotizacion(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateCotizacionFile(file)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    // Extract period from filename or use current date
    const currentDate = new Date()
    const mes = currentDate.getMonth() + 1
    const anio = currentDate.getFullYear()

    // Check if already exists
    const exists = await checkCotizacionExists(mes, anio)
    if (exists) {
      return { 
        success: false, 
        error: `Ya existe una cotización para ${getMonthName(mes)} ${anio}` 
      }
    }

    // Generate filename
    const fileName = `${anio}-${mes.toString().padStart(2, '0')}-cotizacion.pdf`

    // Simulate progress for upload
    if (onProgress) {
      onProgress({ loaded: 0, total: file.size, percentage: 0 })
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cotizaciones')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: 'Error al subir el archivo al almacenamiento' }
    }

    if (onProgress) {
      onProgress({ loaded: file.size * 0.7, total: file.size, percentage: 70 })
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
      return { success: false, error: 'Error al guardar en la base de datos' }
    }

    if (onProgress) {
      onProgress({ loaded: file.size, total: file.size, percentage: 100 })
    }

    return { 
      success: true, 
      message: 'Cotización subida exitosamente',
      cotizacion: dbData
    }
  } catch (error) {
    console.error('Error in uploadCotizacion:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}

export function validateCotizacionFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No se ha seleccionado ningún archivo' }
  }

  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'El archivo debe ser un PDF' }
  }

  if (file.size === 0) {
    return { isValid: false, error: 'El archivo está vacío' }
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    return { isValid: false, error: 'El archivo no puede superar los 10MB' }
  }

  return { isValid: true }
}

export async function checkCotizacionExists(mes: number, anio: number): Promise<boolean> {
  try {
    const cotizacion = await getCotizacionByPeriod(mes, anio)
    return cotizacion !== null
  } catch (error) {
    console.error('Error checking cotizacion existence:', error)
    return false
  }
}

export async function getLastCotizacionUrl(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('url')
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

    return data?.url || null
  } catch (error) {
    console.error('Error getting last cotizacion URL:', error)
    return null
  }
}

export async function getAllCotizaciones(): Promise<Cotizacion[]> {
  return getCotizaciones()
}

export async function getCotizacionStats(): Promise<{
  total: number
  thisMonth: number
  thisYear: number
  lastUpdate: string | null
}> {
  try {
    const cotizaciones = await getCotizaciones()
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    const thisMonth = cotizaciones.filter(c => 
      c.mes === currentMonth && c.anio === currentYear
    ).length

    const thisYear = cotizaciones.filter(c => 
      c.anio === currentYear
    ).length

    const lastUpdate = cotizaciones.length > 0 
      ? cotizaciones[0].fecha_subida 
      : null

    return {
      total: cotizaciones.length,
      thisMonth,
      thisYear,
      lastUpdate
    }
  } catch (error) {
    console.error('Error getting cotizacion stats:', error)
    return {
      total: 0,
      thisMonth: 0,
      thisYear: 0,
      lastUpdate: null
    }
  }
}

export async function cleanupOrphanedFiles(): Promise<{ success: boolean; cleaned: number }> {
  try {
    // Get all files from storage
    const { data: files, error: listError } = await supabase.storage
      .from('cotizaciones')
      .list()

    if (listError) {
      console.error('Error listing files:', listError)
      return { success: false, cleaned: 0 }
    }

    // Get all cotizaciones from database
    const cotizaciones = await getCotizaciones()
    const dbFiles = new Set(cotizaciones.map(c => c.nombre_archivo))

    // Find orphaned files
    const orphanedFiles = files?.filter(file => 
      file.name && !dbFiles.has(file.name)
    ) || []

    if (orphanedFiles.length === 0) {
      return { success: true, cleaned: 0 }
    }

    // Delete orphaned files
    const filesToDelete = orphanedFiles.map(file => file.name).filter(Boolean)
    const { error: deleteError } = await supabase.storage
      .from('cotizaciones')
      .remove(filesToDelete)

    if (deleteError) {
      console.error('Error deleting orphaned files:', deleteError)
      return { success: false, cleaned: 0 }
    }

    console.log(`Cleaned up ${filesToDelete.length} orphaned files`)
    return { success: true, cleaned: filesToDelete.length }
  } catch (error) {
    console.error('Error in cleanupOrphanedFiles:', error)
    return { success: false, cleaned: 0 }
  }
}

// Utility functions
function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[month - 1] || 'Mes inválido'
}
