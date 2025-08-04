"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"

interface ImageGalleryProps {
  images: string[]
  alt: string
  className?: string
}

export default function ImageGallery({ images, alt, className = "" }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({})

  // Filtrar imágenes válidas (no placeholders duplicados)
  const validImages = images.filter((img, index, arr) => {
    // Si es placeholder, solo permitir uno
    if (img.includes("placeholder.svg")) {
      return arr.findIndex((i) => i.includes("placeholder.svg")) === index
    }
    return true
  })

  if (!validImages || validImages.length === 0) {
    return (
      <div className={`bg-gray-700 rounded-lg flex items-center justify-center h-96 ${className}`}>
        <p className="text-gray-400">No hay imágenes disponibles</p>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleImageError = (index: number) => {
    setImageError((prev) => ({ ...prev, [index]: true }))
  }

  const getImageSrc = (src: string, index: number) => {
    if (imageError[index]) {
      return `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(alt)}`
    }
    return src || `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(alt)}`
  }

  return (
    <>
      <div className={`relative group ${className}`}>
        {/* Imagen principal */}
        <div className="relative h-96 bg-gray-700 rounded-lg overflow-hidden cursor-pointer" onClick={openModal}>
          <Image
            src={getImageSrc(validImages[currentIndex], currentIndex) || "/placeholder.svg"}
            alt={alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            onError={() => handleImageError(currentIndex)}
          />

          {/* Overlay con icono de zoom */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 bg-black/50 text-white p-3 rounded-full transition-all duration-200">
              <ZoomIn className="h-6 w-6" />
            </div>
          </div>

          {/* Controles de navegación */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Indicadores */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {validImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentIndex(index)
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {validImages.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-thin">
            {validImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                  index === currentIndex ? "ring-2 ring-blue-500 opacity-100" : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={getImageSrc(image, index) || "/placeholder.svg"}
                  alt={`${alt} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  onError={() => handleImageError(index)}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-full w-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="relative flex items-center justify-center">
              <Image
                src={getImageSrc(validImages[currentIndex], currentIndex) || "/placeholder.svg"}
                alt={alt}
                width={1200}
                height={800}
                className="max-w-full max-h-[85vh] object-contain"
                onError={() => handleImageError(currentIndex)}
              />

              {validImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            <div className="text-center mt-4 text-white">
              {validImages.length > 1 && (
                <p className="text-sm">
                  {currentIndex + 1} de {validImages.length}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
