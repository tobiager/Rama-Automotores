import { supabase } from './supabase'
import { getCotizaciones, uploadCotizacionPDF, validatePDFFile, type Cotizacion } from './cotizaciones'

// Función para obtener la URL de la última cotización
export async function getLastCotizacionUrl(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('url')
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No hay cotizaciones
        return null
      }
      console.error('Error fetching last cotizacion URL:', error)
      return null
    }

    return data?.url || null
  } catch (error) {
    console.error('Error in getLastCotizacionUrl:', error)
    return null
  }
}

// Alias para getAllCotizaciones (requerido por deployment)
export const getAllCotizaciones = getCotizaciones

// Función principal para subir cotización
export async function uploadCotizacion(
  file: File,
  mes: number,
  anio: number,
  options?: {
    onProgress?: (progress: number) => void
    onSuccess?: (cotizacion: Cotizacion) => void
    onError?: (error: string) => void
  }
): Promise<{ success: boolean; message: string; data?: Cotizacion }> {
  try {
    // Notificar inicio
    options?.onProgress?.(0)

    // Validar archivo
    const validation = validateCotizacionFile(file)
    if (!validation.valid) {
      const error = validation.error || 'Archivo inválido'
      options?.onError?.(error)
      return { success: false, message: error }
    }

    options?.onProgress?.(25)

    // Verificar si ya existe
    const exists = await checkCotizacionExists(mes, anio)
    if (exists) {
      const error = `Ya existe una cotización para ${getMonthName(mes)} ${anio}`
      options?.onError?.(error)
      return { success: false, message: error }
    }

    options?.onProgress?.(50)

    // Subir cotización
    const result = await uploadCotizacionPDF(file, mes, anio)
    
    if (result.success && result.data) {
      options?.onProgress?.(100)
      options?.onSuccess?.(result.data)
    } else {
      options?.onError?.(result.message)
    }

    return result
  } catch (error) {
    console.error('Error in uploadCotizacion:', error)
    const errorMessage = 'Error interno del servidor'
    options?.onError?.(errorMessage)
    return {
      success: false,
      message: errorMessage
    }
  }
}

// Función para validar archivo de cotización
export function validateCotizacionFile(file: File): { valid: boolean; error?: string } {
  return validatePDFFile(file)
}

// Función para verificar si existe una cotización
export async function checkCotizacionExists(mes: number, anio: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('id')
      .eq('mes', mes)
      .eq('anio', anio)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No existe
        return false
      }
      console.error('Error checking cotizacion existence:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in checkCotizacionExists:', error)
    return false
  }
}

// Función para obtener estadísticas de cotizaciones
export async function getCotizacionStats(): Promise<{
  total: number
  porAnio: Record<number, number>
  ultimaActualizacion: string | null
}> {
  try {
    const cotizaciones = await getCotizaciones()
    
    const stats = {
      total: cotizaciones.length,
      porAnio: {} as Record<number, number>,
      ultimaActualizacion: null as string | null
    }

    // Contar por año
    cotizaciones.forEach(cotizacion => {
      stats.porAnio[cotizacion.anio] = (stats.porAnio[cotizacion.anio] || 0) + 1
    })

    // Obtener última actualización
    if (cotizaciones.length > 0) {
      const latest = cotizaciones.reduce((latest, current) => {
        const latestDate = new Date(latest.fecha_subida)
        const currentDate = new Date(current.fecha_subida)
        return currentDate > latestDate ? current : latest
      })
      stats.ultimaActualizacion = latest.fecha_subida
    }

    return stats
  } catch (error) {
    console.error('Error in getCotizacionStats:', error)
    return {
      total: 0,
      porAnio: {},
      ultimaActualizacion: null
    }
  }
}

// Función para limpiar archivos huérfanos
export async function cleanupOrphanedFiles(): Promise<{ 
  success: boolean 
  message: string 
  filesRemoved?: number 
}> {
  try {
    // Obtener todos los archivos del storage
    const { data: files, error: listError } = await supabase.storage
      .from('cotizaciones')
      .list()

    if (listError) {
      console.error('Error listing storage files:', listError)
      return {
        success: false,
        message: 'Error al listar archivos del storage'
      }
    }

    if (!files || files.length === 0) {
      return {
        success: true,
        message: 'No hay archivos en el storage',
        filesRemoved: 0
      }
    }

    // Obtener todos los nombres de archivo de la base de datos
    const { data: cotizaciones, error: dbError } = await supabase
      .from('cotizaciones')
      .select('nombre_archivo')

    if (dbError) {
      console.error('Error fetching cotizaciones from DB:', dbError)
      return {
        success: false,
        message: 'Error al consultar la base de datos'
      }
    }

    const dbFileNames = new Set(
      (cotizaciones || [])
        .map(c => c.nombre_archivo)
        .filter(Boolean)
    )

    // Encontrar archivos huérfanos
    const orphanedFiles = files
      .map(file => file.name)
      .filter(fileName => !dbFileNames.has(fileName))

    if (orphanedFiles.length === 0) {
      return {
        success: true,
        message: 'No se encontraron archivos huérfanos',
        filesRemoved: 0
      }
    }

    // Eliminar archivos huérfanos
    const { error: removeError } = await supabase.storage
      .from('cotizaciones')
      .remove(orphanedFiles)

    if (removeError) {
      console.error('Error removing orphaned files:', removeError)
      return {
        success: false,
        message: 'Error al eliminar archivos huérfanos'
      }
    }

    return {
      success: true,
      message: `Se eliminaron ${orphanedFiles.length} archivos huérfanos`,
      filesRemoved: orphanedFiles.length
    }
  } catch (error) {
    console.error('Error in cleanupOrphanedFiles:', error)
    return {
      success: false,
      message: 'Error interno del servidor'
    }
  }
}

// Función utilitaria para obtener nombre del mes
function getMonthName(mes: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[mes - 1] || 'Mes inválido'
}

// Función para obtener información detallada de una cotización
export async function getCotizacionDetails(mes: number, anio: number): Promise<{
  cotizacion: Cotizacion | null
  fileSize?: number
  fileExists?: boolean
}> {
  try {
    const { data: cotizacion, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('mes', mes)
      .eq('anio', anio)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { cotizacion: null }
      }
      console.error('Error fetching cotizacion details:', error)
      return { cotizacion: null }
    }

    // Verificar si el archivo existe en storage
    let fileSize: number | undefined
    let fileExists = false

    if (cotizacion.nombre_archivo) {
      try {
        const { data: fileData, error: fileError } = await supabase.storage
          .from('cotizaciones')
          .list('', {
            search: cotizacion.nombre_archivo
          })

        if (!fileError && fileData && fileData.length > 0) {
          fileExists = true
          fileSize = fileData[0].metadata?.size
        }
      } catch (error) {
        console.warn('Error checking file existence:', error)
      }
    }

    return {
      cotizacion,
      fileSize,
      fileExists
    }
  } catch (error) {
    console.error('Error in getCotizacionDetails:', error)
    return { cotizacion: null }
  }
}
