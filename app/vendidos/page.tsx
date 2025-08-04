import CarCard from "../../components/car-card"
import { getSoldCars } from "../../lib/supabase"

export default async function VendidosPage() {
  const soldCars = await getSoldCars()

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Autos Vendidos</h1>
          <p className="text-gray-400 text-lg">Vehículos que hemos vendido exitosamente</p>
        </div>

        {soldCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {soldCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">Aún no hay vehículos vendidos para mostrar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
