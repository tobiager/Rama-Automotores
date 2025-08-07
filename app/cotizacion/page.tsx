'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { getLastCotizacionUrl } from '@/lib/uploadCotizacion'
import { Search, Download, FileText, AlertCircle, RefreshCw, Loader2, ExternalLink, Calendar } from 'lucide-react'

interface CotizacionData {
  url: string
  fecha_subida: string
  mes?: number
  anio?: number
  nombre_archivo?: string
}

export default function CotizacionPage() {
  const [cotizacionData, setCotizacionData] = useState<CotizacionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadLatestCotizacion()
  }, [])

  const loadLatestCotizacion = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await getLastCotizacionUrl()
      
      if (result && result.url) {
        setCotizacionData(result)
      } else {
        setError('No hay cotizaciones disponibles actualmente')
        setCotizacionData(null)
      }
    } catch (err) {
      console.error('Error loading cotizacion:', err)
      setError('Error al cargar la cotización. Por favor, intenta nuevamente.')
      setCotizacionData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || !cotizacionData?.url) return
    
    setSearching(true)
    
    // Simulate search delay for better UX
    setTimeout(() => {
      // Update PDF URL with search parameters for highlighting
      const searchUrl = `${cotizacionData.url}#search=${encodeURIComponent(searchQuery.trim())}`
      
      // Update iframe src to include search
      const iframe = document.querySelector('iframe') as HTMLIFrameElement
      if (iframe) {
        iframe.src = searchUrl
      }
      
      setSearching(false)
    }, 500)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !searching) {
      handleSearch()
    }
  }

  const handleDownload = () => {
    if (cotizacionData?.url) {
      const link = document.createElement('a')
      link.href = cotizacionData.url
      link.download = cotizacionData.nombre_archivo || 'cotizacion.pdf'
      link.click()
    }
  }

  const handleOpenInNewTab = () => {
    if (cotizacionData?.url) {
      window.open(cotizacionData.url, '_blank')
    }
  }

  const handleRetry = () => {
    loadLatestCotizacion()
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Fecha no disponible'
    }
  }

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[month - 1] || 'Mes inválido'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Cargando cotización más reciente...
              </h2>
              <p className="text-gray-400">
                Obteniendo la información desde la base de datos
              </p>
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Buscador de Cotizaciones
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Busca modelos específicos en la cotización oficial más reciente
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8">
              <Alert variant="destructive" className="bg-red-900/20 border-red-800 max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-300">
                  <div className="flex items-center justify-between">
                    <span>{error}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="ml-4 border-red-600 text-red-300 hover:bg-red-800"
                      disabled={loading}
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                      Reintentar
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Cotization Info */}
          {cotizacionData && (
            <div className="mb-6">
              <Card className="bg-gray-800 border-gray-700 max-w-4xl mx-auto">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-900/30 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          {cotizacionData.mes && cotizacionData.anio 
                            ? `Cotización ${getMonthName(cotizacionData.mes)} ${cotizacionData.anio}`
                            : 'Cotización Oficial'
                          }
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>Subida el {formatDate(cotizacionData.fecha_subida)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600 text-white">
                      Disponible
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search Interface */}
          {cotizacionData && (
            <>
              <div className="mb-8">
                <Card className="bg-gray-800 border-gray-700 max-w-4xl mx-auto">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-center">
                      Buscar Modelo de Vehículo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Buscar modelo en la cotización (ej: Ford Focus, Corolla...)"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={handleSearchKeyPress}
                          className="pl-10 h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                          disabled={searching}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSearch} 
                          disabled={searching || !searchQuery.trim()}
                          className="h-12 px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                          {searching ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span className="hidden sm:inline">Buscando...</span>
                            </>
                          ) : (
                            <>
                              <Search className="mr-2 h-4 w-4" />
                              <span className="hidden sm:inline">Buscar</span>
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="h-12 px-4 sm:px-6 border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Descargar</span>
                        </Button>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          1
                        </div>
                        <span>Escribe el modelo que buscas</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          2
                        </div>
                        <span>Presiona Enter o haz clic en Buscar</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          3
                        </div>
                        <span>Ve los resultados resaltados en el PDF</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* PDF Viewer */}
              <div className="mb-8">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Cotización Oficial
                          {searchQuery && (
                            <span className="text-sm font-normal text-gray-400 ml-2">
                              - Buscando: "{searchQuery}"
                            </span>
                          )}
                        </CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleOpenInNewTab}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Abrir en Nueva Pestaña</span>
                          <span className="sm:hidden">Abrir</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white rounded-lg overflow-hidden" style={{ height: '80vh' }}>
                      <iframe
                        src={`${cotizacionData.url}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        title="Cotización Oficial de Vehículos"
                        className="rounded-lg"
                      />
                    </div>
                    
                    {/* PDF Controls */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenInNewTab}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver en Pantalla Completa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Descargar Archivo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* No PDF Available State */}
          {!cotizacionData && !loading && (
            <div className="text-center py-16">
              <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
                <CardContent className="py-16">
                  <FileText className="h-16 w-16 mx-auto text-gray-600 mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No hay cotizaciones disponibles
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Actualmente no hay ninguna cotización completada en el sistema. 
                    Por favor, contacta al administrador o intenta nuevamente más tarde.
                  </p>
                  <Button
                    onClick={handleRetry}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Reintentar
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
