"use client"
import Link from "next/link"
import Image from "next/image"
import { MessageCircle, Calendar, DollarSign, Eye } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button" // Importar Button

interface Car {
  id: number
  brand: string
  model: string
  year: number
  price: number
  image: string | null
  description: string
  sold: boolean
}

interface CarCardProps {
  car: Car
}

export default function CarCard({ car }: CarCardProps) {
  const [imageError, setImageError] = useState(false)

  const handleWhatsAppClick = () => {
    const message = `Hola, estoy interesado en el ${car.brand} ${car.model} ${car.year}. ¿Podrían darme más información?`
    const whatsappUrl = `https://wa.me/5493624607912?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const getImageSrc = () => {
    if (imageError || !car.image) {
      return `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(car.brand + " " + car.model)}`
    }
    return car.image
  }

  return (
    <div
      className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all hover:shadow-2xl hover:scale-105 ${
        car.sold ? "opacity-75" : ""
      } flex flex-col h-full`}
    >
      <div className="relative">
        <div className="relative h-64 bg-gray-700 rounded-t-lg overflow-hidden">
          <Image
            src={getImageSrc() || "/placeholder.svg"}
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        </div>
        {car.sold && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-t-lg">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg text-lg font-bold">VENDIDO</span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-white flex-1 mr-2">
            {car.brand} {car.model}
          </h3>
          <div className="flex items-center text-gray-400 flex-shrink-0">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-sm">{car.year}</span>
          </div>
        </div>

        <p className="text-gray-400 mb-4 line-clamp-2 text-sm leading-relaxed flex-1">{car.description}</p>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-green-400">
              <DollarSign className="h-5 w-5 mr-1" />
              <span className="text-xl font-bold">{car.price.toLocaleString("es-AR")}</span>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              asChild // Usar asChild para que el Link sea el elemento renderizado
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
            >
              <Link href={`/autos/${car.id}`}>
                <Eye className="h-4 w-4" />
                Ver
              </Link>
            </Button>
            {!car.sold && (
              <Button
                onClick={handleWhatsAppClick}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
