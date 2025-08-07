import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export interface Cotizacion {
  id: number
  periodo: string
  mes: number
  anio: number
  archivo_url: string
  archivo_nombre: string
  created_at: string
  updated_at: string
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
      console.error('Error fetching latest cotizacion:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getLatestCotizacion:', error)
    return null
  }
}

export async function uploadCotizacionPDF(file: File, mes: number, anio: number): Promise<{ success: boolean; message: string; data?: Cotizacion }> {
  try {
    // Check if cotizacion already exists
    const existing = await getCotizacionByPeriod(mes, anio)
    if (existing) {
      return {
        success: false,
        message: `Ya existe una cotización para ${mes}/${anio}`
      }
    }

    // Upload file to Supabase Storage
    const fileName = `cotizacion-${anio}-${mes.toString().padStart(2, '0')}.pdf`
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

    return {
      success: true,
      message: 'Cotización subida exitosamente',
      data: dbData
    }
  } catch (error) {
    console.error('Error in uploadCotizacionPDF:', error)
    return {
      success: false,
      message: 'Error interno del servidor'
    }
  }
}

export async function replaceCotizacion(id: number, file: File): Promise<{ success: boolean; message: string; data?: Cotizacion }> {
  try {
    // Get existing cotizacion
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

    // Delete old file
    const oldFileName = existing.archivo_nombre
    await supabase.storage.from('cotizaciones').remove([oldFileName])

    // Upload new file
    const fileName = `cotizacion-${existing.anio}-${existing.mes.toString().padStart(2, '0')}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cotizaciones')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading replacement file:', uploadError)
      return {
        success: false,
        message: 'Error al subir el nuevo archivo'
      }
    }

    // Get new public URL
    const { data: urlData } = supabase.storage
      .from('cotizaciones')
      .getPublicUrl(fileName)

    // Update database
    const { data: updatedData, error: updateError } = await supabase
      .from('cotizaciones')
      .update({
        archivo_url: urlData.publicUrl,
        archivo_nombre: fileName,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating database:', updateError)
      return {
        success: false,
        message: 'Error al actualizar la base de datos'
      }
    }

    return {
      success: true,
      message: 'Cotización reemplazada exitosamente',
      data: updatedData
    }
  } catch (error) {
    console.error('Error in replaceCotizacion:', error)
    return {
      success: false,
      message: 'Error interno del servidor'
    }
  }
}

export async function deleteCotizacion(id: number): Promise<{ success: boolean; message: string }> {
  try {
    // Get cotizacion to delete file
    const { data: cotizacion, error: fetchError } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !cotizacion) {
      return {
        success: false,
        message: 'Cotización no encontrada'
      }
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('cotizaciones')
      .remove([cotizacion.archivo_nombre])

    if (storageError) {
      console.error('Error deleting file from storage:', storageError)
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('cotizaciones')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting from database:', deleteError)
      return {
        success: false,
        message: 'Error al eliminar de la base de datos'
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

export async function searchModelos(query: string): Promise<string[]> {
  // Placeholder implementation
  return []
}

export async function processPDFContent(file: File): Promise<{ success: boolean; content?: string; error?: string }> {
  // Placeholder implementation
  return {
    success: true,
    content: 'PDF content processed successfully'
  }
}
