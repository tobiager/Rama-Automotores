import { supabase } from './supabase'

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
