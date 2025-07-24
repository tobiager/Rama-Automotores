"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import ImageGallery from "./image-gallery"
import Link from "next/link"
import { ArrowLeft, Calendar, Gauge, Fuel, Settings, Palette, Star } from "lucide-react"

export default function CarDetailClient({ car }: { car: any }) {
  const handleWhatsAppClick = () => {
    const message = `Hola, estoy interesado en el ${car.brand} ${car.model} ${car.year}. ¿Podrían darme más información?`
    const whatsappUrl = `https://wa.me/5493624607912?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const images: string[] = []
  if (car.image && !car.image.includes("placeholder.svg")) images.push(car.image)
  if (car.images?.length > 0) {
    car.images.forEach((img: string) => {
      if (img && !img.includes("placeholder.svg") && img !== car.image) images.push(img)
    })
  }
  if (images.length === 0) {
    images.push(`/placeholder.svg?height=400&width=600&query=${encodeURIComponent(car.brand + " " + car.model)}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 py-20 px-4 max-w-7xl mx-auto">
      <Link href="/autos" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <ImageGallery images={images} alt={`${car.brand} ${car.model}`} />
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
            {car.brand} {car.model}
          </h1>

          <div className="text-3xl font-bold text-green-400 hidden lg:block">
            ${car.price.toLocaleString("es-AR")}
          </div>

          {car.sold && (
            <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              VENDIDO
            </span>
          )}

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-3">Descripción</h2>
            <p className="text-gray-300">{car.description}</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-3">Especificaciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {car.mileage && (
                <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                  <Gauge className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Kilometraje</p>
                    <p className="text-white font-semibold">{car.mileage.toLocaleString()} km</p>
                  </div>
                </div>
              )}
              {car.fuel && (
                <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                  <Fuel className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Combustible</p>
                    <p className="text-white font-semibold">{car.fuel}</p>
                  </div>
                </div>
              )}
              {car.transmission && (
                <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Transmisión</p>
                    <p className="text-white font-semibold">{car.transmission}</p>
                  </div>
                </div>
              )}
              {car.color && (
                <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                  <Palette className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Color</p>
                    <p className="text-white font-semibold">{car.color}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {car.features?.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-3">Características</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {car.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-gray-300">
                    <Star className="h-4 w-4 text-yellow-400" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!car.sold && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-3">¿Te interesa este vehículo?</h2>
              <Button
                onClick={handleWhatsAppClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Consultar por WhatsApp
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
