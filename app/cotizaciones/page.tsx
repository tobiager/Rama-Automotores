"use client"

import { useState, useEffect } from "react"
import { getLastCotizacionUrl } from "@/lib/uploadCotizacion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, Download, AlertCircle, FileText } from 'lucide-react'

export default function CotizacionesPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPdfUrl()
  }, [])

  const loadPdfUrl = async () => {
    setLoading(true)
    setError(null)

    try {
      const url = await getLastCotizacionUrl()
      if (url) {
        setPdfUrl(url)
      } else {
        setError("No hay cotizaciones disponibles actualmente")
      }
    } catch (err) {
      setError("Error al cargar la cotización")
      console.error("Error loading PDF URL:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!searchTerm.trim() || !pdfUrl) return
    
    // Create search URL with the search term
    const searchUrl = `${pdfUrl}#search=${encodeURIComponent(searchTerm)}`
    
    // Update the iframe src to include search
    const iframe = document.getElementById('pdf-viewer') as HTMLIFrameElement
    if (iframe) {
      iframe.src = searchUrl
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-300 text-lg">Cargando cotización...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            Buscador de Cotizaciones
          </h1>
          <p className="text-gray-400 text-lg">
            Encuentra modelos específicos en nuestra cotización mensual
          </p>
        </div>

        {/* Search Bar */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar modelo en la cotización (ej: Ford Focus, Corolla...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 h-12 text-lg"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={!searchTerm.trim() || !pdfUrl}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-12"
              >
                <Search className="mr-2 h-5 w-5" />
                Buscar
              </Button>
              <Button 
                onClick={handleDownload}
                disabled={!pdfUrl}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-6 h-12"
              >
                <Download className="mr-2 h-5 w-5" />
                Descargar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-8 bg-red-900/20 border-red-800 text-red-300">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        )}

        {/* PDF Viewer */}
        {pdfUrl ? (
          <Card className="bg-gray-800 border-gray-700 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-white rounded-lg m-4" style={{ height: '80vh' }}>
                <iframe
                  id="pdf-viewer"
                  src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&search=${encodeURIComponent(searchTerm)}`}
                  className="w-full h-full rounded-lg"
                  title="Cotización PDF"
                  loading="lazy"
                />
              </div>
            </CardContent>
          </Card>
        ) : !loading && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-16">
              <FileText className="h-16 w-16 text-gray-500 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-3">
                No hay cotizaciones disponibles
              </h3>
              <p className="text-gray-400 text-lg mb-6">
                Actualmente no hay cotizaciones cargadas en el sistema.
              </p>
              <Button 
                onClick={loadPdfUrl}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                <Loader2 className="mr-2 h-5 w-5" />
                Intentar nuevamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {pdfUrl && (
          <div className="mt-8 text-center">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-white">1</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Ingresa el modelo</h3>
                <p className="text-gray-400 text-sm">
                  Escribe el nombre del vehículo que buscas en el campo de búsqueda
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-white">2</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Busca en el PDF</h3>
                <p className="text-gray-400 text-sm">
                  El sistema resaltará automáticamente las coincidencias en el documento
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-white">3</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Navega los resultados</h3>
                <p className="text-gray-400 text-sm">
                  Usa los controles del PDF para navegar entre las coincidencias encontradas
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
