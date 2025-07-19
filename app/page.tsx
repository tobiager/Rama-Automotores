import Link from "next/link"
import { Car, Shield, Users, Award } from "lucide-react"
import CarCard from "../components/car-card"
import { getAvailableCars } from "../lib/supabase"

export default async function Home() {
  const cars = await getAvailableCars()
  const featuredCars = cars.slice(0, 3) // Mostrar solo los primeros 3

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            Rama Automotores
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Tu intermediario de confianza en la compra y venta de vehículos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/autos"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 inline-flex items-center justify-center"
            >
              Ver Catálogo
            </Link>
            <Link
              href="/contacto"
              className="border-2 border-gray-600 hover:bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all inline-flex items-center justify-center bg-transparent"
            >
              Contactanos
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">¿Por qué elegirnos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-gray-900 rounded-lg">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Confianza</h3>
              <p className="text-gray-400">Intermediación segura y transparente</p>
            </div>
            <div className="text-center p-6 bg-gray-900 rounded-lg">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Experiencia</h3>
              <p className="text-gray-400">Años de experiencia en el mercado</p>
            </div>
            <div className="text-center p-6 bg-gray-900 rounded-lg">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Variedad</h3>
              <p className="text-gray-400">Amplio catálogo de vehículos</p>
            </div>
            <div className="text-center p-6 bg-gray-900 rounded-lg">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Calidad</h3>
              <p className="text-gray-400">Solo vehículos de primera calidad</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Vehículos Destacados</h2>
            <p className="text-gray-400 text-lg">Descubre nuestra selección premium</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/autos"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all inline-flex items-center justify-center"
            >
              Ver Todos los Autos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
