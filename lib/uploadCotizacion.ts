import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function uploadCotizacion(
  file: File,
  mes: number,
  anio: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const fileName = `${anio}.${String(mes).padStart(2, "0")}-cotizacion.pdf`

    // Intentar subir el archivo
    const { error: uploadError } = await supabase.storage
      .from("cotizaciones-pdf")
      .upload(fileName, file, { upsert: false })

    // Si ya existe, hacer update
    if (uploadError && uploadError.message.includes("The resource already exists")) {
      const { error: updateError } = await supabase.storage
        .from("cotizaciones-pdf")
        .update(fileName, file)
      if (updateError) {
        console.error("Error updating file:", updateError)
        return { success: false, error: updateError.message }
      }
    } else if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return { success: false, error: uploadError.message }
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from("cotizaciones-pdf")
      .getPublicUrl(fileName)
    const publicUrl = urlData.publicUrl

    // Guardar en la tabla
    const { error: dbError } = await supabase
      .from("cotizaciones")
      .upsert(
        [{
          nombre_archivo: fileName,
          url: publicUrl,
          mes,
          anio,
          estado: "completado",
          fecha_subida: new Date().toISOString(),
        }],
        { onConflict: "mes,anio" }
      )

    if (dbError) {
      console.error("Error saving to database:", dbError)
      return { success: false, error: dbError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Error inesperado al subir la cotización" }
  }
  
}

export async function getLastCotizacionUrl(): Promise<string | null> {
  const { data, error } = await supabase
    .from("cotizaciones")
    .select("url")
    .order("fecha_subida", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching last cotización:", error);
    return null;
  }

  return data?.[0]?.url || null;
}

export async function getLastCotizacionPdfUrl(): Promise<string | null> {
  const { data, error } = await supabase
    .storage
    .from("cotizaciones-pdf")
    .list("", { sortBy: { column: "name", order: "desc" }, limit: 1 });

  if (error || !data || data.length === 0) return null;

  const fileName = data[0].name;
  const { data: urlData } = supabase
    .storage
    .from("cotizaciones-pdf")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
