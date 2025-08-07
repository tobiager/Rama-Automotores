import { supabase } from './supabase'
import { getCotizaciones, type Cotizacion } from './cotizaciones'

export interface UploadResult {
  success: boolean
  message: string
  data?: any
}

export async function uploadCotizacion(
  file: File,
  mes: number,
  anio: number
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file) {
      return { success: false, message: 'No se ha seleccionado ningún archivo' }
    }

    if (file.type !== 'application/pdf') {
      return { success: false, message: 'El archivo debe ser un PDF' }
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { success: false, message: 'El archivo no puede ser mayor a 10MB' }
    }

    // Validate month and year
    if (mes < 1 || mes > 12) {
      return { success: false, message: 'El mes debe estar entre 1 y 12' }
    }

    const currentYear = new Date().getFullYear()
    if (anio < currentYear - 5 || anio > currentYear + 5) {
      return { success: false, message: 'El año debe estar en un rango válido' }
    }

    // Generate filename
    const fileName = `${anio}-${mes.toString().padStart(2, '0')}-cotizacion.pdf`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cotizaciones')
      .upload(fileName, file, {
        upsert: true,
        contentType: 'application/pdf'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, message: 'Error al subir el archivo al almacenamiento' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('cotizaciones')
      .getPublicUrl(fileName)

    if (!urlData.publicUrl) {
      return { success: false, message: 'Error al generar la URL del archivo' }
    }

    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from('cotizaciones')
      .upsert({
        mes,
        anio,
        nombre_archivo: fileName,
        url: urlData.publicUrl,
        estado: 'completado',
        fecha_subida: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return { success: false, message: 'Error al guardar en la base de datos' }
    }

    return {
      success: true,
      message: 'Cotización subida exitosamente',
      data: dbData
    }
  } catch (error) {
    console.error('Error in uploadCotizacion:', error)
    return { success: false, message: 'Error inesperado durante la subida' }
  }
}

export async function getLastCotizacionUrl(): Promise<string | null> {
  try {
    console.log('🔍 Buscando última cotización...')
    
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('url')
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        console.log('📭 No se encontraron cotizaciones')
        return null
      }
      console.error('❌ Error fetching last cotizacion:', error)
      throw error
    }

    console.log('📄 URL de última cotización:', data?.url)
    return data?.url || null

  } catch (error) {
    console.error('💥 Error en getLastCotizacionUrl:', error)
    return null
  }
}

export async function getAllCotizaciones(): Promise<Cotizacion[]> {
  return getCotizaciones()
}

export async function getLatestCotizacionUrl(): Promise<string | null> {
  return getLastCotizacionUrl()
}

export async function getCotizacionUrl(mes: number, anio: number): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('url')
      .eq('mes', mes)
      .eq('anio', anio)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching cotizacion URL:', error)
      return null
    }

    return data?.url || null
  } catch (error) {
    console.error('Error in getCotizacionUrl:', error)
    return null
  }
}

export async function validateCotizacionFile(file: File): Promise<{ valid: boolean; message: string }> {
  if (!file) {
    return { valid: false, message: 'No se ha seleccionado ningún archivo' }
  }

  if (file.type !== 'application/pdf') {
    return { valid: false, message: 'El archivo debe ser un PDF' }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, message: 'El archivo no puede ser mayor a 10MB' }
  }

  if (file.size < 1024) {
    return { valid: false, message: 'El archivo parece estar vacío o corrupto' }
  }

  return { valid: true, message: 'Archivo válido' }
}

export async function checkCotizacionExists(mes: number, anio: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('id')
      .eq('mes', mes)
      .eq('anio', anio)
      .single()

    if (error && error.code === 'PGRST116') {
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking cotizacion existence:', error)
    return false
  }
}
