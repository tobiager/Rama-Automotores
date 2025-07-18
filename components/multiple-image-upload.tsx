"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, AlertCircle, Plus } from "lucide-react"
import Image from "next/image"

interface MultipleImageUploadProps {
  currentImages?: string[]
  onImagesChange: (imageUrls: string[]) => void
  className?: string
  maxImages?: number
}

export default function MultipleImageUpload({
  currentImages = [],
  onImagesChange,
  className = "",
  maxImages = 10,
}: MultipleImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>(currentImages)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setError("")

    // Verificar límite de imágenes
    if (images.length + files.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error("Solo se permiten archivos de imagen (JPG, PNG, WEBP)")
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Archivo demasiado grande. Máximo 5MB por imagen.")
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
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newImages = [...images, ...uploadedUrls]

      setImages(newImages)
      onImagesChange(newImages)
      setError("")

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al subir las imágenes"
      setError(errorMessage)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
    setError("")
  }

  const handleClick = () => {
    if (!uploading && images.length < maxImages) {
      fileInputRef.current?.click()
    }
  }

  const handleUrlAdd = (e: React.KeyEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const input = e.target as HTMLInputElement
      const url = input.value.trim()

      if (url && images.length < maxImages) {
        const newImages = [...images, url]
        setImages(newImages)
        onImagesChange(newImages)
        input.value = ""
        setError("")
      }
    }
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setImages(newImages)
    onImagesChange(newImages)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">Imágenes del Vehículo</label>
        <span className="text-sm text-gray-400">
          {images.length}/{maxImages} imágenes
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-600/20 border border-red-600 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="relative w-full h-32 bg-gray-700 rounded-lg overflow-hidden">
              <Image
                src={image || "/placeholder.svg"}
                alt={`Imagen ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                onError={() => {
                  setError(`Error al cargar imagen ${index + 1}`)
                }}
              />

              {/* Overlay con controles */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs"
                      title="Mover izquierda"
                    >
                      ←
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs"
                      title="Mover derecha"
                    >
                      →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                    title="Eliminar imagen"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Indicador de imagen principal */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">Principal</div>
              )}
            </div>
          </div>
        ))}

        {/* Botón para agregar más imágenes */}
        {images.length < maxImages && (
          <div
            onClick={handleClick}
            className={`w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center transition-colors ${
              uploading ? "cursor-not-allowed bg-gray-700/30" : "cursor-pointer hover:border-gray-500 bg-gray-700/50"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 text-xs text-center">Subiendo...</p>
              </div>
            ) : (
              <>
                <Plus className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-400 text-xs text-center">Agregar imagen</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading || images.length >= maxImages}
          className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Subiendo..." : "Seleccionar Imágenes"}
        </button>

        {images.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setImages([])
              onImagesChange([])
              setError("")
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <X className="h-4 w-4" />
            Limpiar Todo
          </button>
        )}
      </div>

      {/* Input manual de URL */}
      <div className="border-t border-gray-600 pt-4">
        <label className="block text-sm font-medium mb-2 text-gray-400">O agregar URL de imagen manualmente</label>
        <input
          type="url"
          onKeyPress={handleUrlAdd}
          disabled={uploading || images.length >= maxImages}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm disabled:opacity-50"
          placeholder="https://ejemplo.com/imagen.jpg (presiona Enter para agregar)"
        />
        <p className="text-xs text-gray-500 mt-1">Presiona Enter después de pegar la URL para agregarla</p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Información adicional */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• La primera imagen será la imagen principal del vehículo</p>
        <p>• Puedes reordenar las imágenes usando los botones de flecha</p>
        <p>• Formatos soportados: JPG, PNG, WEBP (máximo 5MB por imagen)</p>
        <p>• Máximo {maxImages} imágenes por vehículo</p>
      </div>
    </div>
  )
}
