import { supabase } from './supabase'

export interface Cotizacion {
  id: number
  mes: number
  anio: number
  nombre_archivo: string
  url: string
  estado: 'procesando' | 'completado' | 'error'
  fecha_subida: string
}

export async function getCotizaciones(): Promise<Cotizacion[]> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })

    if (error) {
      console.error('Error fetching cotizaciones:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getCotizaciones:', error)
    return []
  }
}

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
        // No rows returned
        return null
      }
      console.error('Error fetching cotizacion by period:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getCotizacionByPeriod:', error)
    return null
  }
}

export async function uploadCotizacionPDF(
  file: File,
  mes: number,
  anio: number
): Promise<{ success: boolean; message: string; data?: Cotizacion }> {
  try {
    // Validate file
    if (!file || file.type !== 'application/pdf') {
      return { success: false, message: 'El archivo debe ser un PDF válido' }
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { success: false, message: 'El archivo no puede ser mayor a 10MB' }
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
      return { success: false, message: 'Error al subir el archivo' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('cotizaciones')
      .getPublicUrl(fileName)

    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from('cotizaciones')
      .upsert({
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
      return { success: false, message: 'Error al guardar en la base de datos' }
    }

    return {
      success: true,
      message: 'Cotización subida exitosamente',
      data: dbData
    }
  } catch (error) {
    console.error('Error in uploadCotizacionPDF:', error)
    return { success: false, message: 'Error inesperado al subir la cotización' }
  }
}

export async function replaceCotizacion(
  id: number,
  file: File,
  mes: number,
  anio: number
): Promise<{ success: boolean; message: string; data?: Cotizacion }> {
  try {
    // Get existing cotizacion
    const { data: existingCotizacion, error: fetchError } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingCotizacion) {
      return { success: false, message: 'Cotización no encontrada' }
    }

    // Delete old file from storage
    const { error: deleteError } = await supabase.storage
      .from('cotizaciones')
      .remove([existingCotizacion.nombre_archivo])

    if (deleteError) {
      console.error('Error deleting old file:', deleteError)
    }

    // Upload new file
    const uploadResult = await uploadCotizacionPDF(file, mes, anio)
    
    if (!uploadResult.success) {
      return uploadResult
    }

    return {
      success: true,
      message: 'Cotización reemplazada exitosamente',
      data: uploadResult.data
    }
  } catch (error) {
    console.error('Error in replaceCotizacion:', error)
    return { success: false, message: 'Error inesperado al reemplazar la cotización' }
  }
}

export async function deleteCotizacion(id: number): Promise<{ success: boolean; message: string }> {
  try {
    // Get cotizacion info
    const { data: cotizacion, error: fetchError } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !cotizacion) {
      return { success: false, message: 'Cotización no encontrada' }
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('cotizaciones')
      .remove([cotizacion.nombre_archivo])

    if (storageError) {
      console.error('Error deleting from storage:', storageError)
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('cotizaciones')
      .delete()
      .eq('id', id)

    if (dbError) {
      console.error('Database delete error:', dbError)
      return { success: false, message: 'Error al eliminar de la base de datos' }
    }

    return { success: true, message: 'Cotización eliminada exitosamente' }
  } catch (error) {
    console.error('Error in deleteCotizacion:', error)
    return { success: false, message: 'Error inesperado al eliminar la cotización' }
  }
}
