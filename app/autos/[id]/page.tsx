"use client"

import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Gauge, Fuel, Settings, Palette, Star, MessageCircle } from "lucide-react"
import { getCarById } from "../../../lib/supabase"
import ImageGallery from "../../../components/image-gallery"
import { Button } from "@/components/ui/button" // Importar Button

interface CarDetailPageProps {
  params: { id: string }
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const carId = Number.parseInt(params.id)
  const car = await getCarById(carId)

  if (!car) {
    notFound()
  }

  const handleWhatsAppClick = () => {
    const message = `Hola, estoy interesado en el ${car.brand} ${car.model} ${car.year} (ID: ${car.id}). ¿Podrían darme más información?`
    const whatsappUrl = `https://wa.me/5493624607912?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  // Preparar array de imágenes - SOLO las que realmente existen
  const images = []

  // Agregar imagen principal si existe y no está vacía
  if (car.image && car.image.trim() !== "" && !car.image.includes("placeholder.svg")) {
    images.push(car.image)
  }

  // Agregar imágenes adicionales si existen y son válidas
  if (car.images && Array.isArray(car.images)) {
    car.images.forEach((img) => {
      if (img && img.trim() !== "" && !img.includes("placeholder.svg") && img !== car.image) {
        // Evitar duplicados
        images.push(img)
      }
    })
  }

  // Si no hay imágenes reales, usar UN SOLO placeholder
  if (images.length === 0) {
    images.push(`/placeholder.svg?height=400&width=600&query=${encodeURIComponent(car.brand + " " + car.model)}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botón volver */}
        <Link
          href="/autos"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <ImageGallery images={images} alt={`${car.brand} ${car.model}`} />

            {/* Información adicional debajo de la galería en móvil */}
            <div className="lg:hidden bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-400">${car.price.toLocaleString("es-AR")}</div>
                {car.sold && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">VENDIDO</span>
                )}
              </div>
            </div>
          </div>

          {/* Información del auto */}
          <div className="space-y-6">
            <div>
              {car.sold && (
                <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  VENDIDO
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
                {car.brand} {car.model}
              </h1>
              <div className="flex items-center text-gray-400 mb-4">
                <Calendar className="h-5 w-5 mr-2" />
                <span className="text-lg">{car.year}</span>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-6 hidden lg:block">
                ${car.price.toLocaleString("es-AR")}
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-3 text-white">Descripción</h2>
              <p className="text-gray-300 leading-relaxed">{car.description}</p>
            </div>

            {/* Especificaciones */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">Especificaciones</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {car.mileage && car.mileage > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <Gauge className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400">Kilometraje</p>
                      <p className="font-semibold text-white">{car.mileage.toLocaleString()} km</p>
                    </div>
                  </div>
                )}
                {car.fuel && (
                  <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <Fuel className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400">Combustible</p>
                      <p className="font-semibold text-white">{car.fuel}</p>
                    </div>
                  </div>
                )}
                {car.transmission && (
                  <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <Settings className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400">Transmisión</p>
                      <p className="font-semibold text-white">{car.transmission}</p>
                    </div>
                  </div>
                )}
                {car.color && (
                  <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <Palette className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400">Color</p>
                      <p className="font-semibold text-white">{car.color}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Características */}
            {car.features && car.features.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-white">Características</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de contacto por WhatsApp */}
            {!car.sold && (
              <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                <h2 className="text-xl font-semibold text-white">¿Te interesa este vehículo?</h2>
                <p className="text-gray-300 text-sm">
                  Contáctanos por WhatsApp para más información, fotos adicionales o para coordinar una visita.
                </p>

                <Button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  Consultar por WhatsApp
                </Button>
              </div>
            )}

            {/* Mensaje para autos vendidos */}
            {car.sold && (
              <div className="bg-red-600/20 border border-red-600 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-red-400 mb-2">Vehículo Vendido</h2>
                <p className="text-red-300">
                  Este vehículo ya ha sido vendido. Puedes ver otros vehículos disponibles en nuestro catálogo.
                </p>
                <Link
                  href="/autos"
                  className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Ver Otros Vehículos
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
