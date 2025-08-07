"use client"

import { useState } from "react"
import { uploadCotizacion } from "@/lib/uploadCotizacion"

export default function UploadCotizacion() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    const result = await uploadCotizacion(file)
    setLoading(false)

    if (result.success) {
      setSuccess("Cotización subida correctamente")
      setError(null)
    } else {
      setError(result.error || "Ocurrió un error")
      setSuccess(null)
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md space-y-4 max-w-md">
      <h2 className="text-xl font-semibold text-white">Subir PDF de Cotización del Mes</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-white"
      />
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        {loading ? "Subiendo..." : "Subir"}
      </button>
      {success && <p className="text-green-400">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
