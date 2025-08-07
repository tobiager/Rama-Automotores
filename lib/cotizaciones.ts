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

export async function getAllCotizaciones(): Promise<Cotizacion[]> {
  return getCotizaciones()
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

export async function getLatestCotizacion(): Promise<Cotizacion | null> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null
      }
      console.error('Error fetching latest cotizacion:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getLatestCotizacion:', error)
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

    // Check if cotizacion already exists for this period
    const existingCotizacion = await getCotizacionByPeriod(mes, anio)
    if (existingCotizacion) {
      return { success: false, message: `Ya existe una cotización para ${mes}/${anio}. Use la función de reemplazar.` }
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

    // Process PDF content (placeholder for future implementation)
    const pdfContent = await processPDFContent(file)

    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from('cotizaciones')
      .insert({
        mes,
        anio,
        nombre_archivo: fileName,
        url: urlData.publicUrl,
        estado: 'completado',
        fecha_subida: new Date().toISOString(),
        total_modelos: pdfContent.totalModelos
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('cotizaciones').remove([fileName])
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

    // Generate new filename
    const fileName = `${anio}-${mes.toString().padStart(2, '0')}-cotizacion.pdf`

    // Upload new file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cotizaciones')
      .upload(fileName, file, {
        upsert: true,
        contentType: 'application/pdf'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, message: 'Error al subir el nuevo archivo' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('cotizaciones')
      .getPublicUrl(fileName)

    // Process PDF content
    const pdfContent = await processPDFContent(file)

    // Update database record
    const { data: updateData, error: updateError } = await supabase
      .from('cotizaciones')
      .update({
        mes,
        anio,
        nombre_archivo: fileName,
        url: urlData.publicUrl,
        fecha_subida: new Date().toISOString(),
        total_modelos: pdfContent.totalModelos
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      // Clean up uploaded file if database update fails
      await supabase.storage.from('cotizaciones').remove([fileName])
      return { success: false, message: 'Error al actualizar en la base de datos' }
    }

    return {
      success: true,
      message: 'Cotización reemplazada exitosamente',
      data: updateData
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

export async function searchModelos(query: string): Promise<ModeloAuto[]> {
  try {
    // This is a placeholder implementation
    // In a real application, this would search through PDF content or a separate models table
    console.log('Searching for models with query:', query)
    
    // For now, return empty array as this feature is not yet implemented
    return []
  } catch (error) {
    console.error('Error in searchModelos:', error)
    return []
  }
}

export async function processPDFContent(file: File): Promise<{ totalModelos?: number }> {
  try {
    // Placeholder for future PDF processing implementation
    // This would use a PDF parsing library to extract model information
    console.log('Processing PDF content for file:', file.name)
    
    // For now, return undefined total_modelos
    // In the future, this could use libraries like pdf-parse or pdf2pic
    // to extract and count vehicle models from the PDF
    
    return { totalModelos: undefined }
  } catch (error) {
    console.error('Error processing PDF content:', error)
    return { totalModelos: undefined }
  }
}

// Additional utility functions
export async function getCotizacionesByYear(anio: number): Promise<Cotizacion[]> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('anio', anio)
      .order('mes', { ascending: false })

    if (error) {
      console.error('Error fetching cotizaciones by year:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getCotizacionesByYear:', error)
    return []
  }
}

export async function getCotizacionesByMonth(mes: number): Promise<Cotizacion[]> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('mes', mes)
      .order('anio', { ascending: false })

    if (error) {
      console.error('Error fetching cotizaciones by month:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getCotizacionesByMonth:', error)
    return []
  }
}

export function getMonthName(mes: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[mes - 1] || 'Mes inválido'
}

export function formatCotizacionPeriod(cotizacion: Cotizacion): string {
  return `${getMonthName(cotizacion.mes)} ${cotizacion.anio}`
}
