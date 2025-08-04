import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface Cotizacion {
  id: string
  nombre_archivo: string
  url: string
  mes: number
  anio: number
  fecha_subida: string
  estado: "procesando" | "completado" | "error"
  total_modelos?: number
}

export interface Modelo {
  id: string
  nombre_modelo: string
  version?: string
  precio: number
  cotizacion_id: string
}

export async function uploadCotizacionPDF(
  file: File,
  mes: number,
  anio: number,
): Promise<{ success: boolean; cotizacionId?: string; error?: string }> {
  try {
    const fileName = `${anio}-${String(mes).padStart(2, "0")}-cotizacion.pdf`

    // Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("cotizaciones-pdf")
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return { success: false, error: uploadError.message }
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage.from("cotizaciones-pdf").getPublicUrl(fileName)

    // Crear registro en la base de datos
    const { data: cotizacion, error: dbError } = await supabase
      .from("cotizaciones")
      .insert([
        {
          nombre_archivo: fileName,
          url: urlData.publicUrl,
          mes,
          anio,
          estado: "procesando",
        },
      ])
      .select()
      .single()

    if (dbError) {
      console.error("Error saving to database:", dbError)
      return { success: false, error: dbError.message }
    }

    return { success: true, cotizacionId: cotizacion.id }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Error inesperado al subir la cotización" }
  }
}

export async function getCotizaciones(): Promise<Cotizacion[]> {
  const { data, error } = await supabase.from("cotizaciones").select("*").order("fecha_subida", { ascending: false })

  if (error) {
    console.error("Error getting cotizaciones:", error)
    return []
  }

  return data || []
}

export async function getLastCotizacion(): Promise<Cotizacion | null> {
  const { data, error } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("estado", "completado")
    .order("fecha_subida", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error("Error getting last cotizacion:", error)
    return null
  }

  return data
}

export async function searchModelos(searchTerm: string, cotizacionId?: string): Promise<Modelo[]> {
  let query = supabase.from("modelos").select("*")

  if (cotizacionId) {
    query = query.eq("cotizacion_id", cotizacionId)
  }

  if (searchTerm) {
    query = query.or(`nombre_modelo.ilike.%${searchTerm}%,version.ilike.%${searchTerm}%`)
  }

  const { data, error } = await query.order("nombre_modelo").limit(50)

  if (error) {
    console.error("Error searching modelos:", error)
    return []
  }

  return data || []
}

export async function updateCotizacionStatus(
  cotizacionId: string,
  estado: "procesando" | "completado" | "error",
  totalModelos?: number,
): Promise<boolean> {
  const updateData: any = { estado }
  if (totalModelos !== undefined) {
    updateData.total_modelos = totalModelos
  }

  const { error } = await supabase.from("cotizaciones").update(updateData).eq("id", cotizacionId)

  if (error) {
    console.error("Error updating cotizacion status:", error)
    return false
  }

  return true
}

export async function insertModelos(modelos: Omit<Modelo, "id">[]): Promise<boolean> {
  const { error } = await supabase.from("modelos").insert(modelos)

  if (error) {
    console.error("Error inserting modelos:", error)
    return false
  }

  return true
}
