"use client"

import { useState, useEffect, useMemo } from "react"
import { searchModelos, getAllCotizaciones, type Cotizacion } from "@/lib/cotizaciones"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Car, DollarSign, Calendar } from "lucide-react"

interface ModeloResult {
  id: string
  nombre_modelo: string
  version: string | null
  precio: number | null
  cotizacion_id: string
  cotizacion: {
    mes: number
    anio: number
  }
}

export default function CotizacionesSearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<ModeloResult[]>([])
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [selectedCotizacion, setSelectedCotizacion] = useState<string>("latest")
  const [loading, setLoading] = useState(false)
  const [loadingCotizaciones, setLoadingCotizaciones] = useState(true)

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  useEffect(() => {
    loadCotizaciones()
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch()
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, selectedCotizacion])

  const loadCotizaciones = async () => {
    setLoadingCotizaciones(true)
    const data = await getAllCotizaciones()
    const completedCotizaciones = data.filter((c) => c.estado === "completado")
    setCotizaciones(completedCotizaciones)
    setLoadingCotizaciones(false)
  }

  const performSearch = async () => {
    setLoading(true)
    try {
      const cotizacionId = selectedCotizacion === "latest" ? undefined : selectedCotizacion
      const searchResults = await searchModelos(searchTerm, cotizacionId)
      setResults(searchResults)
    } catch (error) {
      console.error("Error searching:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return "Precio no disponible"
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text

    const regex = new RegExp(`(${term})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  const groupedResults = useMemo(() => {
    const groups: { [key: string]: ModeloResult[] } = {}

    results.forEach((result) => {
      const key = result.nombre_modelo
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(result)
    })

    return groups
  }, [results])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buscador de Cotizaciones</h1>
        <p className="text-gray-600">Encuentra modelos de autos y sus precios en nuestras cotizaciones mensuales</p>
      </div>

      {/* Controles de búsqueda */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Modelos
          </CardTitle>
          <CardDescription>Ingresa el nombre del modelo o marca que buscas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Ej: Toyota Corolla, Ford Ka, Chevrolet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={selectedCotizacion} onValueChange={setSelectedCotizacion} disabled={loadingCotizaciones}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cotización" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Última cotización</SelectItem>
                  {cotizaciones.map((cotizacion) => (
                    <SelectItem key={cotizacion.id} value={cotizacion.id}>
                      {meses[cotizacion.mes - 1]} {cotizacion.anio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando modelos...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados de búsqueda */}
      {searchTerm && !loading && (
        <div className="space-y-6">
          {Object.keys(groupedResults).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No se encontraron resultados para "{searchTerm}"</p>
                <p className="text-sm text-gray-400 mt-2">Intenta con otros términos de búsqueda</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Resultados para "{searchTerm}"</h2>
                <Badge variant="secondary">
                  {results.length} resultado{results.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              {Object.entries(groupedResults).map(([modelo, versiones]) => (
                <Card key={modelo}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      {highlightSearchTerm(modelo, searchTerm)}
                    </CardTitle>
                    {versiones[0].cotizacion && (
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {meses[versiones[0].cotizacion.mes - 1]} {versiones[0].cotizacion.anio}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {versiones.map((version) => (
                        <div key={version.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            {version.version && (
                              <p className="font-medium">{highlightSearchTerm(version.version, searchTerm)}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {highlightSearchTerm(version.nombre_modelo, searchTerm)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                              <DollarSign className="h-4 w-4" />
                              {formatPrice(version.precio)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      {/* Estado inicial */}
      {!searchTerm && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Comienza tu búsqueda</h3>
            <p className="text-gray-500">Ingresa el nombre de un modelo o marca para ver los precios disponibles</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
