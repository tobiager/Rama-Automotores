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
        // No se encontró la cotización
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

// Función para obtener la cotización más reciente
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
        // No se encontró ninguna cotización
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

// Función para subir nueva cotización
export async function uploadCotizacionPDF(
  file: File,
  mes: number,
  anio: number
): Promise<{ success: boolean; message: string; data?: Cotizacion }> {
  try {
    // Validar archivo
    const validation = validatePDFFile(file)
    if (!validation.valid) {
      return { success: false, message: validation.error || 'Archivo inválido' }
    }

    // Verificar si ya existe una cotización para este período
    const existing = await getCotizacionByPeriod(mes, anio)
    if (existing) {
      return {
        success: false,
        message: `Ya existe una cotización para ${getMonthName(mes)} ${anio}. Use la función de reemplazar.`
      }
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileName = `cotizacion-${anio}-${mes.toString().padStart(2, '0')}-${timestamp}.pdf`
    
    // Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cotizaciones')
      .upload(fileName, file, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError)
      return {
        success: false,
        message: 'Error al subir el archivo PDF'
      }
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('cotizaciones')
      .getPublicUrl(fileName)

    // Procesar contenido del PDF (placeholder)
    const pdfContent = await processPDFContent(file)

    // Crear registro en la base de datos
    const { data: cotizacionData, error: dbError } = await supabase
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
      console.error('Error creating cotizacion record:', dbError)
      
      // Limpiar archivo subido si falla la inserción en BD
      await supabase.storage
        .from('cotizaciones')
        .remove([fileName])

      return {
        success: false,
        message: 'Error al crear el registro de cotización'
      }
    }

    return {
      success: true,
      message: 'Cotización subida exitosamente',
      data: cotizacionData
    }
  } catch (error) {
    console.error('Error in uploadCotizacionPDF:', error)
    return {
      success: false,
      message: 'Error interno del servidor'
    }
  }
}

// Función para reemplazar cotización existente
export async function replaceCotizacion(
  id: number,
  file: File,
  mes: number,
  anio: number
): Promise<{ success: boolean; message: string; data?: Cotizacion }> {
  try {
    // Validar archivo
    const validation = validatePDFFile(file)
    if (!validation.valid) {
      return { success: false, message: validation.error || 'Archivo inválido' }
    }

    // Buscar cotización existente
    const { data: existing, error: fetchError } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return {
        success: false,
        message: 'Cotización no encontrada'
      }
    }

    // Generar nombre único para el nuevo archivo
    const timestamp = Date.now()
    const fileName = `cotizacion-${anio}-${mes.toString().padStart(2, '0')}-${timestamp}.pdf`
    
    // Subir nuevo archivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cotizaciones')
      .upload(fileName, file, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading replacement PDF:', uploadError)
      return {
        success: false,
        message: 'Error al subir el nuevo archivo PDF'
      }
    }

    // Obtener URL pública del nuevo archivo
    const { data: urlData } = supabase.storage
      .from('cotizaciones')
      .getPublicUrl(fileName)

    // Procesar contenido del PDF
    const pdfContent = await processPDFContent(file)

    // Actualizar registro en la base de datos
    const { data: cotizacionData, error: updateError } = await supabase
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
      console.error('Error updating cotizacion record:', updateError)
      
      // Limpiar nuevo archivo si falla la actualización
      await supabase.storage
        .from('cotizaciones')
        .remove([fileName])

      return {
        success: false,
        message: 'Error al actualizar el registro de cotización'
      }
    }

    // Eliminar archivo anterior si la actualización fue exitosa
    if (existing.nombre_archivo) {
      try {
        await supabase.storage
          .from('cotizaciones')
          .remove([existing.nombre_archivo])
      } catch (error) {
        console.warn('Error removing old PDF file:', error)
        // No fallar la operación por esto
      }
    }

    return {
      success: true,
      message: 'Cotización reemplazada exitosamente',
      data: cotizacionData
    }
  } catch (error) {
    console.error('Error in replaceCotizacion:', error)
    return {
      success: false,
      message: 'Error interno del servidor'
    }
  }
}

// Función para eliminar cotización
export async function deleteCotizacion(id: number): Promise<{ success: boolean; message: string }> {
  try {
    // Buscar cotización existente
    const { data: existing, error: fetchError } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return {
        success: false,
        message: 'Cotización no encontrada'
      }
    }

    // Eliminar registro de la base de datos
    const { error: deleteError } = await supabase
      .from('cotizaciones')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting cotizacion record:', deleteError)
      return {
        success: false,
        message: 'Error al eliminar la cotización'
      }
    }

    // Eliminar archivo físico
    if (existing.nombre_archivo) {
      try {
        await supabase.storage
          .from('cotizaciones')
          .remove([existing.nombre_archivo])
      } catch (error) {
        console.warn('Error removing PDF file:', error)
        // No fallar la operación por esto
      }
    }

    return { 
      success: true, 
      message: 'Cotización eliminada exitosamente' 
    }
  } catch (error) {
    console.error('Error in deleteCotizacion:', error)
    return {
      success: false,
      message: 'Error interno del servidor'
    }
  }
}

// Función placeholder para búsqueda de modelos (requerida por deployment)
export async function searchModelos(query: string): Promise<ModeloAuto[]> {
  try {
    // Placeholder implementation - en el futuro buscaría en contenido de PDFs
    console.log('Searching for models with query:', query)
    
    // Por ahora retorna array vacío ya que no tenemos tabla de modelos
    return []
  } catch (error) {
    console.error('Error in searchModelos:', error)
    return []
  }
}

// Función placeholder para procesar contenido PDF (requerida por deployment)
export async function processPDFContent(file: File): Promise<{ totalModelos?: number }> {
  try {
    // Placeholder implementation - en el futuro extraería modelos del PDF
    console.log('Processing PDF content for file:', file.name)
    console.log('File size:', file.size, 'bytes')
    
    // Por ahora retorna undefined ya que no procesamos el contenido
    return { totalModelos: undefined }
  } catch (error) {
    console.error('Error in processPDFContent:', error)
    return { totalModelos: undefined }
  }
}

// Función utilitaria para obtener nombre del mes
export function getMonthName(mes: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[mes - 1] || 'Mes inválido'
}

// Función utilitaria para formatear período
export function formatPeriod(mes: number, anio: number): string {
  return `${getMonthName(mes)} ${anio}`
}

// Función utilitaria para validar archivo PDF
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No se seleccionó ningún archivo' }
  }

  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'El archivo debe ser un PDF' }
  }

  // Límite de 10MB
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'El archivo no puede ser mayor a 10MB' }
  }

  return { valid: true }
}

// Funciones adicionales para compatibilidad
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

export function formatCotizacionPeriod(cotizacion: Cotizacion): string {
  return `${getMonthName(cotizacion.mes)} ${cotizacion.anio}`
}
