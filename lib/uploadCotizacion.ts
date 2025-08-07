import { supabase } from './supabase'
import { getCotizaciones, getLatestCotizacion, getAllCotizaciones } from './cotizaciones'

export async function getLastCotizacionUrl(): Promise<string | null> {
  try {
    const latest = await getLatestCotizacion()
    return latest?.archivo_url || null
  } catch (error) {
    console.error('Error getting last cotizacion URL:', error)
    return null
  }
}

export { getAllCotizaciones }

export async function uploadCotizacion(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; message: string; url?: string }> {
  try {
    if (!file || file.type !== 'application/pdf') {
      return { success: false, message: 'El archivo debe ser un PDF' }
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, message: 'El archivo no puede superar los 10MB' }
    }

    const fileName = `cotizacion-${Date.now()}.pdf`
    
    // Simulate progress
    if (onProgress) {
      onProgress(25)
    }

    const { data, error } = await supabase.storage
      .from('cotizaciones')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (onProgress) {
      onProgress(75)
    }

    if (error) {
      console.error('Upload error:', error)
      return { success: false, message: 'Error al subir el archivo' }
    }

    const { data: urlData } = supabase.storage
      .from('cotizaciones')
      .getPublicUrl(fileName)

    if (onProgress) {
      onProgress(100)
    }

    return {
      success: true,
      message: 'Archivo subido exitosamente',
      url: urlData.publicUrl
    }
  } catch (error) {
    console.error('Error in uploadCotizacion:', error)
    return { success: false, message: 'Error interno del servidor' }
  }
}

export function validateCotizacionFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No se seleccionó ningún archivo' }
  }

  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'El archivo debe ser un PDF' }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'El archivo no puede superar los 10MB' }
  }

  return { valid: true }
}

export async function checkCotizacionExists(mes: number, anio: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('id')
      .eq('mes', mes)
      .eq('anio', anio)
      .single()

    return !error && !!data
  } catch (error) {
    return false
  }
}

export async function getCotizacionStats(): Promise<{
  total: number
  totalSize: number
  lastUpload: string | null
}> {
  try {
    const cotizaciones = await getCotizaciones()
    
    return {
      total: cotizaciones.length,
      totalSize: 0, // Would need to calculate from storage
      lastUpload: cotizaciones[0]?.created_at || null
    }
  } catch (error) {
    console.error('Error getting cotizacion stats:', error)
    return {
      total: 0,
      totalSize: 0,
      lastUpload: null
    }
  }
}

export async function cleanupOrphanedFiles(): Promise<{ cleaned: number; errors: string[] }> {
  try {
    // This would implement cleanup logic for orphaned files
    console.log('Cleanup orphaned files - placeholder implementation')
    return {
      cleaned: 0,
      errors: []
    }
  } catch (error) {
    console.error('Error cleaning up orphaned files:', error)
    return {
      cleaned: 0,
      errors: ['Error during cleanup']
    }
  }
}
