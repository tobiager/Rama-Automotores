import CarFilters from "../../components/car-filters"
import { getAvailableCars } from "../../lib/supabase"

export default async function AutosPage() {
  const cars = await getAvailableCars()

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Autos en Venta</h1>
          <p className="text-gray-400 text-lg">Explora nuestra selección de vehículos premium disponibles</p>
        </div>

        <CarFilters cars={cars} />
      </div>
    </div>
  )
}
