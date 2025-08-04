"use client"

import { useState } from "react"

interface UseImageUploadReturn {
  uploading: boolean
  uploadImage: (file: File) => Promise<string>
  error: string | null
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true)
    setError(null)

    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Por favor selecciona un archivo de imagen válido")
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("El archivo es demasiado grande. Máximo 5MB permitido.")
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
      const filename = `cars/${timestamp}-${randomString}.${extension}`

      // Upload to Vercel Blob
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const { url } = await response.json()

      if (!url) {
        throw new Error("No se recibió URL de la imagen")
      }

      return url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al subir la imagen"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  return {
    uploading,
    uploadImage,
    error,
  }
}
