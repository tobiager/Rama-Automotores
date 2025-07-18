"use client"

import { useState, useMemo } from "react"
import { Search, Filter, X } from "lucide-react"
import CarCard from "./car-card"
import type { Car } from "../lib/supabase"

interface CarFiltersProps {
  cars: Car[]
}

export default function CarFilters({ cars }: CarFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 })
  const [yearRange, setYearRange] = useState({ min: 2015, max: 2024 })
  const [showFilters, setShowFilters] = useState(false)

  // Obtener marcas únicas
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(cars.map((car) => car.brand))]
    return uniqueBrands.sort()
  }, [cars])

  // Filtrar autos
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesSearch =
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesBrand = selectedBrand === "" || car.brand === selectedBrand
      const matchesPrice = car.price >= priceRange.min && car.price <= priceRange.max
      const matchesYear = car.year >= yearRange.min && car.year <= yearRange.max

      return matchesSearch && matchesBrand && matchesPrice && matchesYear
    })
  }, [cars, searchTerm, selectedBrand, priceRange, yearRange])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedBrand("")
    setPriceRange({ min: 0, max: 200000 })
    setYearRange({ min: 2015, max: 2024 })
  }

  return (
    <div>
      {/* Barra de búsqueda */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por marca, modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Botón de filtros móvil */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {filteredCars.length} vehículo{filteredCars.length !== 1 ? "s" : ""} encontrado
          {filteredCars.length !== 1 ? "s" : ""}
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Panel de filtros */}
        <div className={`md:w-80 ${showFilters ? "block" : "hidden md:block"}`}>
          <div className="bg-gray-800 p-6 rounded-lg sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <button onClick={clearFilters} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
                <X className="h-4 w-4" />
                Limpiar
              </button>
            </div>

            <div className="space-y-6">
              {/* Filtro por marca */}
              <div>
                <label className="block text-sm font-medium mb-2">Marca</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Todas las marcas</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por precio */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Precio: ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Filtro por año */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Año: {yearRange.min} - {yearRange.max}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="2015"
                    max="2024"
                    value={yearRange.min}
                    onChange={(e) => setYearRange((prev) => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="2015"
                    max="2024"
                    value={yearRange.max}
                    onChange={(e) => setYearRange((prev) => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de autos */}
        <div className="flex-1">
          {filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">No se encontraron vehículos con los filtros seleccionados.</p>
              <button
                onClick={clearFilters}
                className="mt-4 bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
