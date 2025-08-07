import { createClient } from '@supabase/supabase-js'
import { getCotizaciones, type Cotizacion } from './cotizaciones'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function getLastCotizacionUrl(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('archivo_url')
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      console.error('Error fetching last cotizacion:', error)
      return null
    }

    return data.archivo_url
  } catch (error) {
    console.error('Error in getLastCotizacionUrl:', error)
    return null
  }
}

export async function getAllCotizaciones(): Promise<Cotizacion[]> {
  return getCotizaciones()
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export async function uploadCotizacion(
  file: File,
  mes: number,
  anio: number,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ success: boolean; message: string; data?: Cotizacion }> {
  try {
    // Validate file
    const validation = validateCotizacionFile(file)
    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'Archivo inválido'
      }
    }

    // Check if already exists
    const exists = await checkCotizacionExists(mes, anio)
    if (exists) {
      return {
        success: false,
        message: `Ya existe una cotización para ${mes}/${anio}`
      }
    }

    // Simulate progress
    if (onProgress) {
      onProgress({ loaded: 0, total: file.size, percentage: 0 })
    }

    const fileName = `cotizacion-${anio}-${mes.toString().padStart(2, '0')}.pdf`
    
    // Upload with progress simulation
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cotizaciones')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return {
        success: false,
        message: 'Error al subir el archivo'
      }
    }

    if (onProgress) {
      onProgress({ loaded: file.size * 0.8, total: file.size, percentage: 80 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('cotizaciones')
      .getPublicUrl(fileName)

    // Save to database
    const periodo = `${mes.toString().padStart(2, '0')}/${anio}`
    const { data: dbData, error: dbError } = await supabase
      .from('cotizaciones')
      .insert({
        periodo,
        mes,
        anio,
        archivo_url: urlData.publicUrl,
        archivo_nombre: fileName
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving to database:', dbError)
      // Clean up uploaded file
      await supabase.storage.from('cotizaciones').remove([fileName])
      return {
        success: false,
        message: 'Error al guardar en la base de datos'
      }
    }

    if (onProgress) {
      onProgress({ loaded: file.size, total: file.size, percentage: 100 })
    }

    return {
      success: true,
      message: 'Cotización subida exitosamente',
      data: dbData
    }
  } catch (error) {
    console.error('Error in uploadCotizacion:', error)
    return {
      success: false,
      message: 'Error interno del servidor'
    }
  }
}

export function validateCotizacionFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== 'application/pdf') {
    return {
      valid: false,
      error: 'El archivo debe ser un PDF'
    }
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'El archivo no puede ser mayor a 10MB'
    }
  }

  // Check file name
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return {
      valid: false,
      error: 'El archivo debe tener extensión .pdf'
    }
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
  byYear: Record<number, number>
}> {
  try {
    const cotizaciones = await getCotizaciones()
    
    const stats = {
      total: cotizaciones.length,
      totalSize: 0, // Would need to calculate from storage
      byYear: {} as Record<number, number>
    }

    cotizaciones.forEach(cotizacion => {
      const year = cotizacion.anio
      stats.byYear[year] = (stats.byYear[year] || 0) + 1
    })

    return stats
  } catch (error) {
    console.error('Error getting cotizacion stats:', error)
    return {
      total: 0,
      totalSize: 0,
      byYear: {}
    }
  }
}

export async function cleanupOrphanedFiles(): Promise<{ cleaned: number; errors: string[] }> {
  try {
    // Get all files from storage
    const { data: files, error: listError } = await supabase.storage
      .from('cotizaciones')
      .list()

    if (listError || !files) {
      return { cleaned: 0, errors: ['Error listing files'] }
    }

    // Get all cotizaciones from database
    const cotizaciones = await getCotizaciones()
    const dbFileNames = new Set(cotizaciones.map(c => c.archivo_nombre))

    // Find orphaned files
    const orphanedFiles = files.filter(file => !dbFileNames.has(file.name))

    if (orphanedFiles.length === 0) {
      return { cleaned: 0, errors: [] }
    }

    // Delete orphaned files
    const filesToDelete = orphanedFiles.map(file => file.name)
    const { error: deleteError } = await supabase.storage
      .from('cotizaciones')
      .remove(filesToDelete)

    if (deleteError) {
      return { cleaned: 0, errors: [deleteError.message] }
    }

    return { cleaned: orphanedFiles.length, errors: [] }
  } catch (error) {
    console.error('Error cleaning up orphaned files:', error)
    return { cleaned: 0, errors: ['Internal server error'] }
  }
}
