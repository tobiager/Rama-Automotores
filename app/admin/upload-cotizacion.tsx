"use client"
import { useState } from "react"
import { uploadCotizacion } from "@/lib/uploadCotizacion"

export default function UploadCotizacion() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    const result = await uploadCotizacion(file)
    alert(result.success ? "Cotización subida con éxito" : `Error: ${result.error}`)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={handleUpload} disabled={loading} className="bg-blue-600 px-4 py-2 rounded text-white">
        {loading ? "Subiendo..." : "Subir cotización"}
      </button>
    </div>
  )
}
