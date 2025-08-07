'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { getCotizaciones, getCotizacionByPeriod, type Cotizacion } from '@/lib/cotizaciones'
import { FileText, Download, Calendar, AlertCircle, Info, ExternalLink } from 'lucide-react'

export default function CotizacionPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [selectedCotizacion, setSelectedCotizacion] = useState<Cotizacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMes, setSelectedMes] = useState('')
  const [selectedAnio, setSelectedAnio] = useState('')

  useEffect(() => {
    loadCotizaciones()
  }, [])

  const loadCotizaciones = async () => {
    try {
      setLoading(true)
      const data = await getCotizaciones()
      setCotizaciones(data)
      
      // Auto-select the most recent cotizacion
      if (data.length > 0) {
        setSelectedCotizacion(data[0])
      }
    } catch (error) {
      console.error('Error loading cotizaciones:', error)
      setError('Error al cargar las cotizaciones')
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodSearch = async () => {
    if (!selectedMes || !selectedAnio) {
      setError('Por favor selecciona mes y año')
      return
    }

    try {
      setLoading(true)
      setError('')
      const cotizacion = await getCotizacionByPeriod(parseInt(selectedMes), parseInt(selectedAnio))
      
      if (cotizacion) {
        setSelectedCotizacion(cotizacion)
      } else {
        setError(`No se encontró cotización para ${getMonthName(parseInt(selectedMes))} ${selectedAnio}`)
        setSelectedCotizacion(null)
      }
    } catch (error) {
      console.error('Error searching cotizacion:', error)
      setError('Error al buscar la cotización')
    } finally {
      setLoading(false)
    }
  }

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[month - 1] || 'Mes inválido'
  }

  const getAvailableYears = () => {
    const years = new Set<number>()
    cotizaciones.forEach(c => years.add(c.anio))
    return Array.from(years).sort((a, b) => b - a)
  }

  const getAvailableMonths = (year: number) => {
    const months = new Set<number>()
    cotizaciones
      .filter(c => c.anio === year)
      .forEach(c => months.add(c.mes))
    return Array.from(months).sort((a, b) => a - b)
  }

  if (loading && cotizaciones.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Cargando cotizaciones...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Cotizaciones Mensuales
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Consulta las cotizaciones oficiales de vehículos actualizadas mensualmente
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Period Search */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Buscar por Período
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Año
                    </label>
                    <Select value={selectedAnio} onValueChange={setSelectedAnio}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Selecciona el año" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {getAvailableYears().map((year) => (
                          <SelectItem key={year} value={year.toString()} className="text-white">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mes
                    </label>
                    <Select 
                      value={selectedMes} 
                      onValueChange={setSelectedMes}
                      disabled={!selectedAnio}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Selecciona el mes" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {selectedAnio && getAvailableMonths(parseInt(selectedAnio)).map((mes) => (
                          <SelectItem key={mes} value={mes.toString()} className="text-white">
                            {getMonthName(mes)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handlePeriodSearch}
                    disabled={!selectedMes || !selectedAnio || loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Buscar Cotización
                  </Button>
                </CardContent>
              </Card>

              {/* Available Cotizaciones */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Cotizaciones Disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cotizaciones.map((cotizacion) => (
                      <button
                        key={cotizacion.id}
                        onClick={() => setSelectedCotizacion(cotizacion)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedCotizacion?.id === cotizacion.id
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {getMonthName(cotizacion.mes)} {cotizacion.anio}
                            </p>
                            <p className="text-sm opacity-75">
                              {new Date(cotizacion.fecha_subida).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <Badge variant={
                            cotizacion.estado === 'completado' ? 'default' : 
                            cotizacion.estado === 'error' ? 'destructive' : 'secondary'
                          }>
                            {cotizacion.estado}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {cotizaciones.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400">No hay cotizaciones disponibles</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {error && (
                <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              {selectedCotizacion ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-2xl">
                          Cotización {getMonthName(selectedCotizacion.mes)} {selectedCotizacion.anio}
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-2">
                          Subida el {new Date(selectedCotizacion.fecha_subida).toLocaleDateString('es-ES')}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => window.open(selectedCotizacion.url, '_blank')}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Abrir en Nueva Pestaña
                        </Button>
                        <Button
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = selectedCotizacion.url
                            link.download = selectedCotizacion.nombre_archivo
                            link.click()
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar PDF
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* PDF Viewer */}
                    <div className="relative">
                      <div className="bg-gray-900 rounded-lg p-4 mb-4">
                        <Alert className="bg-blue-900/20 border-blue-800 mb-4">
                          <Info className="h-4 w-4 text-blue-400" />
                          <AlertDescription className="text-blue-300">
                            <strong>Consejos para visualizar el PDF:</strong>
                            <ul className="mt-2 space-y-1 text-sm">
                              <li>• Usa los controles del visor para hacer zoom</li>
                              <li>• Puedes descargar el archivo para mejor visualización</li>
                              <li>• En móviles, es recomendable abrir en nueva pestaña</li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                        
                        <div className="bg-white rounded-lg overflow-hidden" style={{ height: '800px' }}>
                          <iframe
                            src={`${selectedCotizacion.url}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                            title={`Cotización ${getMonthName(selectedCotizacion.mes)} ${selectedCotizacion.anio}`}
                          />
                        </div>
                      </div>
                      
                      {/* Alternative download options */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedCotizacion.url, '_blank')}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Ver en Pantalla Completa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = selectedCotizacion.url
                            link.download = selectedCotizacion.nombre_archivo
                            link.click()
                          }}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Descargar Archivo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="py-16">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto text-gray-600 mb-6" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Selecciona una Cotización
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Elige una cotización de la lista o busca por período específico
                      </p>
                      {cotizaciones.length === 0 && (
                        <Alert className="bg-yellow-900/20 border-yellow-800 max-w-md mx-auto">
                          <AlertCircle className="h-4 w-4 text-yellow-400" />
                          <AlertDescription className="text-yellow-300">
                            No hay cotizaciones disponibles en este momento. 
                            Por favor, vuelve a intentar más tarde.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
