"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  currentImage?: string
  onImageChange: (imageUrl: string) => void
  className?: string
}

export default function ImageUpload({ currentImage, onImageChange, className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string>(currentImage || "")
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError("")

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo es demasiado grande. Máximo 5MB permitido.")
      return
    }

    setUploading(true)

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

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

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl)

      // Update with actual URL
      setPreview(url)
      onImageChange(url)
      setError("")
    } catch (error) {
      console.error("Upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al subir la imagen"
      setError(errorMessage)
      setPreview(currentImage || "")

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview("")
    onImageChange("")
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setPreview(url)
    onImageChange(url)
    setError("")
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium mb-2">Imagen del Vehículo</label>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-600/20 border border-red-600 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        {/* Preview Area */}
        {preview ? (
          <div className="relative group">
            <div className="relative w-full h-48 bg-gray-700 rounded-lg overflow-hidden">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => {
                  setError("Error al cargar la imagen")
                  setPreview("")
                }}
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Subiendo...</span>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all duration-200"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className={`w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center transition-colors ${
              uploading ? "cursor-not-allowed bg-gray-700/30" : "cursor-pointer hover:border-gray-500 bg-gray-700/50"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 text-center">Subiendo imagen...</p>
              </div>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-400 text-center">Haz clic para seleccionar una imagen</p>
                <p className="text-gray-500 text-sm mt-1">PNG, JPG, WEBP hasta 5MB</p>
              </>
            )}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Subiendo..." : preview ? "Cambiar Imagen" : "Seleccionar Imagen"}
          </button>

          {preview && !uploading && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <X className="h-4 w-4" />
              Quitar
            </button>
          )}
        </div>

        {/* Manual URL Input */}
        <div className="border-t border-gray-600 pt-4">
          <label className="block text-sm font-medium mb-2 text-gray-400">O ingresa una URL de imagen</label>
          <input
            type="url"
            value={preview}
            onChange={handleUrlChange}
            disabled={uploading}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm disabled:opacity-50"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  )
}
